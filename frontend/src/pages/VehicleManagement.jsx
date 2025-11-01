import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { vehicleAPI } from '../services/api';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFuel, setFilterFuel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // === Fetch Vehicles ===
  const fetchVehicles = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const filters = { page, limit: itemsPerPage };

      if (filterFuel !== 'all') filters.fuelType = filterFuel;
      if (filterCategory !== 'all') filters.vehicleCategory = filterCategory;
      if (searchTerm) filters.search = searchTerm;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response = await vehicleAPI.getAll(filters);
      if (response.success) {
        setVehicles(response.data);
        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setTotalPages(response.pagination.pages);
          setCurrentPage(response.pagination.page);
        } else {
          setTotalItems(response.count || response.data.length);
          setTotalPages(Math.ceil((response.count || response.data.length) / itemsPerPage));
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [filterFuel, filterCategory, searchTerm, startDate, endDate, itemsPerPage]);

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [fetchVehicles, currentPage]);

  // === Exit Handler ===
  const handleExitVehicle = async (id) => {
    try {
      await vehicleAPI.updateExit(id);
      await fetchVehicles(currentPage);
    } catch (error) {
      console.error('Error updating exit:', error);
      alert('Failed to record exit');
    }
  };

  // === Export CSV ===
  const exportToCSV = () => {
    const headers = ['Number Plate', 'Category', 'Fuel Type', 'Confidence', 'Entry Time', 'Exit Time', 'Zone'];
    const rows = vehicles.map(v => [
      v.number_plate,
      v.vehicle_category,
      v.fuel_type,
      v.confidence,
      new Date(v.entry_time).toLocaleString(),
      v.exit_time ? new Date(v.exit_time).toLocaleString() : 'Still Inside',
      v.zone_name || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle_logs_page_${currentPage}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // === Pagination handlers ===
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchVehicles(page);
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchVehicles(1);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {vehicles.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0} -{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} vehicles
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download size={18} className="mr-2" />
          Export Current Page
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Plate</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Enter number plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVehicles(1)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
            <select
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="EV">EV (Electric)</option>
              <option value="ICE">ICE (Combustion)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Private">Private</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={() => fetchVehicles(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setFilterFuel('all');
              setFilterCategory('all');
              setSearchTerm('');
              fetchVehicles(1);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Number Plate', 'Category', 'Fuel Type', 'Confidence', 'Entry Time', 'Exit Time', 'Zone', 'Action'].map((h) => (
                  <th key={h} className="text-left p-4 font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No vehicles found</td></tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono font-semibold">{v.number_plate}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${v.vehicle_category === 'Commercial' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {v.vehicle_category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${v.fuel_type === 'EV' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {v.fuel_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{v.confidence}%</td>
                    <td className="p-4 text-gray-600">{formatTime(v.entry_time)}</td>
                    <td className="p-4 text-gray-600">
                      {v.exit_time ? formatTime(v.exit_time) : <span className="text-green-600 font-semibold">Still Inside</span>}
                    </td>
                    <td className="p-4 text-gray-600">{v.zone_name || 'N/A'}</td>
                    <td className="p-4">
                      {!v.exit_time && (
                        <button
                          onClick={() => handleExitVehicle(v.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                        >
                          Record Exit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            {/* Left */}
            <div className="text-sm text-gray-700">
              Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
            </div>

            {/* Center */}
            <div className="flex items-center space-x-2">
              <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:text-gray-400"><ChevronsLeft size={20} /></button>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:text-gray-400"><ChevronLeft size={20} /></button>

              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={i} className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <button key={p} onClick={() => goToPage(p)} className={`px-3 py-1 rounded ${currentPage === p ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'}`}>{p}</button>
                )
              )}

              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:text-gray-400"><ChevronRight size={20} /></button>
              <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded text-gray-700 hover:bg-gray-200 disabled:text-gray-400"><ChevronsRight size={20} /></button>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-700">Go to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManagement;
