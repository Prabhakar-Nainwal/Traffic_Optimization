const db = require('../config/db');

class VehicleLog {
  // Get all vehicle logs with filters
  static async findAll(filters = {}) {
    let query = `
      SELECT v.*, p.name as zone_name 
      FROM vehicle_logs v
      LEFT JOIN parking_zones p ON v.parking_zone_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.fuelType) {
      query += ' AND v.fuel_type = ?';
      params.push(filters.fuelType);
    }

    if (filters.vehicleCategory) {
      query += ' AND v.vehicle_category = ?';
      params.push(filters.vehicleCategory);
    }

    if (filters.search) {
      query += ' AND v.number_plate LIKE ?';
      params.push(`%${filters.search}%`);
    }

    if (filters.startDate) {
      query += ' AND v.entry_time >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND v.entry_time <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY v.entry_time DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Get recent vehicles
  static async findRecent(limit = 10) {
    const query = `
      SELECT v.*, p.name as zone_name 
      FROM vehicle_logs v
      LEFT JOIN parking_zones p ON v.parking_zone_id = p.id
      ORDER BY v.entry_time DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]);
    return rows;
  }

  // Update vehicle exit
  static async updateExit(id) {
    const query = `
      UPDATE vehicle_logs 
      SET exit_time = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await db.execute(query, [id]);
    
    const [rows] = await db.execute('SELECT * FROM vehicle_logs WHERE id = ?', [id]);
    return rows[0];
  }

  // Get fuel distribution
  static async getFuelDistribution() {
    const query = `
      SELECT fuel_type, COUNT(*) as count
      FROM vehicle_logs
      GROUP BY fuel_type
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Get daily counts for last 7 days
  static async getDailyCounts() {
    const query = `
      SELECT 
        DATE(entry_time) as date,
        COUNT(*) as count,
        AVG(pollution_score) as avg_pollution
      FROM vehicle_logs
      WHERE entry_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(entry_time)
      ORDER BY date ASC
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Get pollution index (based on EV vs ICE ratio)
  static async getPollutionIndex() {
    const query = `
      SELECT 
        SUM(CASE WHEN fuel_type = 'ICE' THEN 1 ELSE 0 END) as ice_count,
        SUM(CASE WHEN fuel_type = 'EV' THEN 1 ELSE 0 END) as ev_count,
        COUNT(*) as total
      FROM vehicle_logs
      WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `;
    
    const [rows] = await db.execute(query);
    const { ice_count, ev_count, total } = rows[0];
    
    if (total === 0) return 0;
    
    // Calculate pollution index: 0-100 scale
    // 100% ICE = 100, 100% EV = 0
    const pollutionIndex = Math.round((ice_count / total) * 100);
    return pollutionIndex;
  }

  // Find by ID
  static async findById(id) {
    const query = 'SELECT * FROM vehicle_logs WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
}

module.exports = VehicleLog;