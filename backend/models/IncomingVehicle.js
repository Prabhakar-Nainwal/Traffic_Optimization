const db = require('../config/db');

class IncomingVehicle {
  // Create new incoming vehicle from ANPR
  static async create(vehicleData) {
    const { numberPlate, vehicleCategory, fuelType, confidence, decision, parkingZoneId, pollutionScore } = vehicleData;
    
    const query = `
      INSERT INTO incoming_vehicles 
      (number_plate, vehicle_category, fuel_type, confidence, decision, parking_zone_id, pollution_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      numberPlate,
      vehicleCategory,
      fuelType,
      confidence,
      decision,
      parkingZoneId || null,
      pollutionScore || 0
    ]);
    
    return { id: result.insertId, ...vehicleData, processed: false };
  }

  // Get all unprocessed incoming vehicles
  static async findUnprocessed(limit = 50) {
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

  // Get all incoming vehicles
  static async findAll(limit = 100) {
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

  // Get by ID
  static async findById(id) {
    const query = 'SELECT * FROM incoming_vehicles WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Process vehicle (move to vehicle_logs if allowed)
  static async processVehicle(id) {
    try {
      const vehicle = await this.findById(id);
      
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      // Mark as processed
      await db.execute(
        'UPDATE incoming_vehicles SET processed = TRUE WHERE id = ?',
        [id]
      );

      // Only move to vehicle_logs if decision is 'Allow'
      if (vehicle.decision === 'Allow') {
        const insertQuery = `
          INSERT INTO vehicle_logs 
          (number_plate, vehicle_category, fuel_type, confidence, entry_time, parking_zone_id, pollution_score)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(insertQuery, [
          vehicle.number_plate,
          vehicle.vehicle_category,
          vehicle.fuel_type,
          vehicle.confidence,
          vehicle.detected_time,
          vehicle.parking_zone_id,
          vehicle.pollution_score
        ]);

        return { 
          success: true, 
          vehicleLogId: result.insertId,
          message: 'Vehicle allowed and moved to permanent logs'
        };
      } else if (vehicle.decision === 'Warn') {
        return {
          success: true,
          message: 'Vehicle warned - parking full'
        };
      } else {
        return {
          success: true,
          message: 'Commercial vehicle - ignored'
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Get statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN processed = FALSE THEN 1 ELSE 0 END) as unprocessed,
        SUM(CASE WHEN processed = TRUE THEN 1 ELSE 0 END) as processed,
        SUM(CASE WHEN decision = 'Allow' THEN 1 ELSE 0 END) as allowed,
        SUM(CASE WHEN decision = 'Warn' THEN 1 ELSE 0 END) as warned,
        SUM(CASE WHEN decision = 'Ignore' THEN 1 ELSE 0 END) as ignored,
        AVG(pollution_score) as avg_pollution
      FROM incoming_vehicles
      WHERE detected_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `;
    
    const [rows] = await db.execute(query);
    return rows[0];
  }

  // Delete old processed entries
  static async deleteProcessed(daysOld = 7) {
    const query = `
      DELETE FROM incoming_vehicles 
      WHERE processed = TRUE 
      AND detected_time < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const [result] = await db.execute(query, [daysOld]);
    return result.affectedRows;
  }
}

module.exports = IncomingVehicle;