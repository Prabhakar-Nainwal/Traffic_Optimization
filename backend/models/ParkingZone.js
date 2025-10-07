const db = require('../config/db');

class ParkingZone {
  // Create new parking zone
  static async create(zoneData) {
    const { name, totalSlots, location } = zoneData;
    
    const query = `
      INSERT INTO parking_zones (name, total_slots, location)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [name, totalSlots, location || '']);
    
    return { id: result.insertId, ...zoneData, occupiedSlots: 0, isActive: true };
  }

  // Get all active zones
  static async findAll() {
    const query = `
      SELECT 
        id,
        name,
        total_slots as totalSlots,
        occupied_slots as occupiedSlots,
        location,
        is_active as isActive,
        (total_slots - occupied_slots) as availableSlots,
        ROUND((occupied_slots / total_slots) * 100) as occupancyPercentage,
        created_at as createdAt,
        updated_at as updatedAt
      FROM parking_zones
      WHERE is_active = TRUE
      ORDER BY name ASC
    `;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  // Find by ID
  static async findById(id) {
    const query = `
      SELECT 
        id,
        name,
        total_slots as totalSlots,
        occupied_slots as occupiedSlots,
        location,
        is_active as isActive,
        (total_slots - occupied_slots) as availableSlots,
        ROUND((occupied_slots / total_slots) * 100) as occupancyPercentage,
        created_at as createdAt,
        updated_at as updatedAt
      FROM parking_zones
      WHERE id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  // Update parking zone
  static async update(id, zoneData) {
    const { name, totalSlots, location } = zoneData;
    
    const query = `
      UPDATE parking_zones
      SET name = ?, total_slots = ?, location = ?
      WHERE id = ?
    `;
    
    await db.execute(query, [name, totalSlots, location || '', id]);
    
    return await this.findById(id);
  }

  // Soft delete
  static async softDelete(id) {
    const query = 'UPDATE parking_zones SET is_active = FALSE WHERE id = ?';
    await db.execute(query, [id]);
    return true;
  }

  // Increment occupied slots
  static async incrementOccupancy(id) {
    const query = `
      UPDATE parking_zones
      SET occupied_slots = occupied_slots + 1
      WHERE id = ? AND occupied_slots < total_slots
    `;
    
    await db.execute(query, [id]);
    return await this.findById(id);
  }

  // Decrement occupied slots
  static async decrementOccupancy(id) {
    const query = `
      UPDATE parking_zones
      SET occupied_slots = GREATEST(occupied_slots - 1, 0)
      WHERE id = ?
    `;
    
    await db.execute(query, [id]);
    return await this.findById(id);
  }

  // Check if zone exists
  static async exists(name) {
    const query = 'SELECT COUNT(*) as count FROM parking_zones WHERE name = ?';
    const [rows] = await db.execute(query, [name]);
    return rows[0].count > 0;
  }
}

module.exports = ParkingZone;