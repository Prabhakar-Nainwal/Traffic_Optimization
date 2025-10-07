const db = require('../config/db');

class IncomingVehicle {
  // Create new incoming vehicle entry (from ANPR)
  static async create(vehicleData) {
    const { numberPlate, fuelType, decision, parkingZoneId, pollutionScore } = vehicleData;
    
    const query = `
      INSERT INTO incoming_vehicles (number_plate, fuel_type, decision, parking_zone_id, pollution_score)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      numberPlate,
      fuelType,
      decision,
      parkingZoneId || null,
      pollutionScore || 0
    ]);
    
    return { id: result.insertId, ...vehicleData, processed: false };
  }

  // Get all unprocessed incoming vehicles
  static async findUnprocessed(limit = 10) {
    const query = `
      SELECT iv.*, p.name as zone_name 
      FROM incoming_vehicles iv
      LEFT JOIN parking_zones p ON iv.parking_zone_id = p.id
      WHERE iv.processed = FALSE
      ORDER BY iv.detected_time DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]);
    return rows;
  }

  // Get all incoming vehicles (including processed)
  static async findAll(limit = 50) {
    const query = `
      SELECT iv.*, p.name as zone_name 
      FROM incoming_vehicles iv
      LEFT JOIN parking_zones p ON iv.parking_zone_id = p.id
      ORDER BY iv.detected_time DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]);
    return rows;
  }

  // Get incoming vehicle by ID
  static async findById(id) {
    const query = 'SELECT * FROM incoming_vehicles WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Mark vehicle as processed and move to permanent logs
  static async processVehicle(id) {
    try {
      // Get incoming vehicle data
      const vehicle = await this.findById(id);
      
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      // Mark as processed
      await db.execute(
        'UPDATE incoming_vehicles SET processed = TRUE WHERE id = ?',
        [id]
      );

      // Move to vehicle_logs (permanent storage)
      const insertQuery = `
        INSERT INTO vehicle_logs 
        (number_plate, fuel_type, entry_time, decision, parking_zone_id, pollution_score)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(insertQuery, [
        vehicle.number_plate,
        vehicle.fuel_type,
        vehicle.detected_time,
        vehicle.decision,
        vehicle.parking_zone_id,
        vehicle.pollution_score
      ]);

      return { 
        success: true, 
        vehicleLogId: result.insertId,
        message: 'Vehicle processed and moved to permanent logs'
      };
    } catch (error) {
      throw error;
    }
  }

  // Batch process multiple vehicles
  static async processMultiple(ids) {
    const results = [];
    
    for (const id of ids) {
      try {
        const result = await this.processVehicle(id);
        results.push({ id, ...result });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Auto-process old unprocessed vehicles (cleanup)
  static async autoProcessOld(minutesOld = 30) {
    const query = `
      SELECT id FROM incoming_vehicles 
      WHERE processed = FALSE 
      AND detected_time < DATE_SUB(NOW(), INTERVAL ? MINUTE)
    `;
    
    const [rows] = await db.execute(query, [minutesOld]);
    const ids = rows.map(row => row.id);
    
    if (ids.length > 0) {
      return await this.processMultiple(ids);
    }
    
    return [];
  }

  // Delete old processed entries (cleanup)
  static async deleteProcessed(daysOld = 7) {
    const query = `
      DELETE FROM incoming_vehicles 
      WHERE processed = TRUE 
      AND detected_time < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const [result] = await db.execute(query, [daysOld]);
    return result.affectedRows;
  }

  // Get statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN processed = FALSE THEN 1 ELSE 0 END) as unprocessed,
        SUM(CASE WHEN processed = TRUE THEN 1 ELSE 0 END) as processed,
        AVG(pollution_score) as avg_pollution
      FROM incoming_vehicles
      WHERE detected_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `;
    
    const [rows] = await db.execute(query);
    return rows[0];
  }
}

module.exports = IncomingVehicle;