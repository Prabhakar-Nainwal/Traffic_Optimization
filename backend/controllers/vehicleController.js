const VehicleLog = require('../models/VehicleLog');
const ParkingZone = require('../models/ParkingZone');
const db = require('../config/db');

// Get all vehicle logs with filters and pagination
exports.getAllVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const filters = {
      fuelType: req.query.fuelType,
      vehicleCategory: req.query.vehicleCategory,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: limit,
      offset: offset
    };

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM vehicle_logs v
      WHERE 1=1
    `;
    const countParams = [];

    if (filters.fuelType) {
      countQuery += ' AND v.fuel_type = ?';
      countParams.push(filters.fuelType);
    }

    if (filters.vehicleCategory) {
      countQuery += ' AND v.vehicle_category = ?';
      countParams.push(filters.vehicleCategory);
    }

    if (filters.search) {
      countQuery += ' AND v.number_plate LIKE ?';
      countParams.push(`%${filters.search}%`);
    }

    if (filters.startDate) {
      countQuery += ' AND v.entry_time >= ?';
      countParams.push(filters.startDate);
    }

    if (filters.endDate) {
      countQuery += ' AND v.entry_time <= ?';
      countParams.push(filters.endDate);
    }

    const db = require('../config/db');
    const [countResult] = await db.execute(countQuery, countParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated vehicles
    const vehicles = await VehicleLog.findAll(filters);

    res.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
      pagination: {
        page: page,
        limit: limit,
        total: totalItems,
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle logs',
      error: error.message
    });
  }
};

// Update vehicle exit
exports.updateVehicleExit = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicleBefore = await VehicleLog.findById(id);

    if (!vehicleBefore) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const vehicle = await VehicleLog.updateExit(id);

    // Update parking zone occupancy
    if (vehicleBefore.parking_zone_id) {
      await ParkingZone.decrementOccupancy(vehicleBefore.parking_zone_id);
    }

    const io = req.app.get('io');
    io.emit('vehicleExit', vehicle);

    res.json({
      success: true,
      message: 'Vehicle exit recorded',
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle exit:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle exit',
      error: error.message
    });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const fuelDistribution = await VehicleLog.getFuelDistribution();
    const dailyCount = await VehicleLog.getDailyCounts();
    const pollutionIndex = await VehicleLog.getPollutionIndex();

    res.json({
      success: true,
      data: {
        fuelDistribution,
        dailyCount,
        pollutionIndex
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};


// Traffic Analytics Page
exports.getTrafficAnalytics = async (req, res) => {
  try {
    const db = require("../config/db");
    const { type = "month", startDate, endDate } = req.query;

    let groupBy, labelFormat;
    let whereClause = "decision IN ('Allow', 'Warn', 'Ignore')";
    const params = [];

    // 🔹 Apply date filter if range is provided
    if (startDate && endDate) {
      whereClause += " AND DATE(detected_time) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    // 🔹 Determine grouping logic
    if (type === "year") {
      groupBy = "YEAR(detected_time)";
      labelFormat = "%Y";
    }
    else if (type === "month") {
      groupBy = 'DATE_FORMAT(detected_time, "%Y-%m")';
      labelFormat = "%b %Y";

      // ✅ Restrict to last 12 months
      whereClause += " AND detected_time >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)";
    }
    else {
      // 🔹 Day or custom range
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

        if (diffDays > 31) {
          groupBy = "YEARWEEK(detected_time, 1)";
          labelFormat = "Week %u";
        } else {
          groupBy = "DATE(detected_time)";
          labelFormat = "%Y-%m-%d";
        }
      } else {
        groupBy = "DATE(detected_time)";
        labelFormat = "%Y-%m-%d";
      }
    }

const [rows] = await db.query(
  `
  SELECT 
CASE 
  WHEN "${type}" = "day" THEN DATE_FORMAT(MIN(detected_time), "%d %b %Y")
  WHEN "${type}" = "month" THEN DATE_FORMAT(MIN(detected_time), "%b %Y")
  WHEN "${type}" = "year" THEN DATE_FORMAT(MIN(detected_time), "%Y")
  WHEN "${type}" = "week" THEN 
    CONCAT('Week ', LPAD(WEEK(MIN(detected_time), 1), 2, '0'), ' (', DATE_FORMAT(MIN(detected_time), "%b %Y"), ')')
  ELSE DATE_FORMAT(MIN(detected_time), "%d %b %Y")
END AS label,
    SUM(CASE WHEN decision = 'Allow' THEN 1 ELSE 0 END) AS allowed,
    SUM(CASE WHEN decision = 'Warn' THEN 1 ELSE 0 END) AS warned,
    SUM(CASE WHEN decision = 'Ignore' THEN 1 ELSE 0 END) AS ignored,
    COUNT(*) AS total
  FROM incoming_vehicles
  WHERE ${whereClause}
  GROUP BY ${groupBy}
  ORDER BY ${groupBy} ASC
  LIMIT 100;
  `,
  params
);

    res.json({
      success: true,
      data: rows,
      labelField: labelFormat,
    });
  } catch (error) {
    console.error("Error fetching traffic analytics:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




