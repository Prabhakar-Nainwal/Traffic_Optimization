const db = require('../config/db');

class VehicleLog {
  // Create new vehicle entry
  static async create(vehicleData) {
    const { numberPlate, fuelType, decision, parkingZoneId, pollutionScore } = vehicleData;
    
    const query = `
      INSERT INTO vehicle_logs (number_plate, fuel_type, decision, parking_zone_id, pollution_score)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      numberPlate,
      fuelType,
      decision,
      parkingZoneId || null,
      pollutionScore || 0
    ]);
    
    return { id: result.insertId, ...vehicleData };
  }

  // Get all vehicles with filters
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

    if (filters.decision) {
      query += ' AND v.decision = ?';
      params.push(filters.decision);
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

  // Get pollution index (average of last hour)
  static async getPollutionIndex() {
    const query = `
      SELECT AVG(pollution_score) as pollution_index
      FROM vehicle_logs
      WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `;
    
    const [rows] = await db.execute(query);
    return Math.round(rows[0].pollution_index || 0);
  }

  // Find by ID
  static async findById(id) {
    const query = 'SELECT * FROM vehicle_logs WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }
}

module.exports = VehicleLog;