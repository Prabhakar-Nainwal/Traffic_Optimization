import React, { useState, useEffect } from 'react';
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

  
  const fetchVehicles = async (page = 1) => {
    try {
      setLoading(true);
      const filters = {
        page: page,
        limit: itemsPerPage
      };
      
      if (filterFuel !== 'all') filters.fuelType = filterFuel;
      if (filterCategory !== 'all') filters.vehicleCategory = filterCategory;
      if (searchTerm) filters.search = searchTerm;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate ;
      
      const response = await vehicleAPI.getAll(filters);
      if (response.success) {
        setVehicles(response.data);
        
        // Set pagination info if available from backend
        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setTotalPages(response.pagination.pages);
          setCurrentPage(response.pagination.page);
        } else {
          // If no pagination from backend, calculate client-side
          setTotalItems(response.count || response.data.length);
          setTotalPages(Math.ceil((response.count || response.data.length) / itemsPerPage));
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitVehicle = async (id) => {
    try {
      await vehicleAPI.updateExit(id);
      await fetchVehicles(currentPage);
    } catch (error) {
      console.error('Error updating exit:', error);
      alert('Failed to record exit');
    }
  };

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

  // Pagination handlers
  const goToFirstPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
      fetchVehicles(1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      fetchVehicles(newPage);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      fetchVehicles(newPage);
    }
  };

  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      setCurrentPage(totalPages);
      fetchVehicles(totalPages);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      fetchVehicles(pageNumber);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    fetchVehicles(1);
  };

useEffect(() => {
  fetchVehicles(currentPage);
}, [filterFuel, filterCategory, itemsPerPage, currentPage]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {vehicles.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} vehicles
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
    {/* Search Plate */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">Search Plate</label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Enter number plate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setCurrentPage(1);
              fetchVehicles(1);
            }
          }}
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

    {/* Vehicle Category */}
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

    {/* Start Date */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* End Date */}
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

  {/* Apply / Clear Buttons */}
  <div className="flex justify-end mt-4 space-x-3">
    <button
      onClick={() => {
        setCurrentPage(1);
        fetchVehicles(1);
      }}
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
        setCurrentPage(1);
        fetchVehicles(1);
      }}
      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
    >
      Clear
    </button>
  </div>
</div>


      {/* Vehicle Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Number Plate</th>
                <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fuel Type</th>
                <th className="text-left p-4 font-semibold text-gray-700">Confidence</th>
                <th className="text-left p-4 font-semibold text-gray-700">Entry Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Exit Time</th>
                <th className="text-left p-4 font-semibold text-gray-700">Zone</th>
                <th className="text-left p-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map(vehicle => (
                  <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono font-semibold">{vehicle.number_plate}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        vehicle.vehicle_category === 'Commercial' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vehicle.vehicle_category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        vehicle.fuel_type === 'EV' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.fuel_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{vehicle.confidence}%</td>
                    <td className="p-4 text-gray-600">{formatTime(vehicle.entry_time)}</td>
                    <td className="p-4 text-gray-600">
                      {vehicle.exit_time ? formatTime(vehicle.exit_time) : (
                        <span className="text-green-600 font-semibold">Still Inside</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{vehicle.zone_name || 'N/A'}</td>
                    <td className="p-4">
                      {!vehicle.exit_time && (
                        <button
                          onClick={() => handleExitVehicle(vehicle.id)}
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

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Left: Items info */}
              <div className="text-sm text-gray-700">
                Page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </div>

              {/* Center: Page numbers */}
              <div className="flex items-center space-x-2">
                {/* First Page */}
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="First Page"
                >
                  <ChevronsLeft size={20} />
                </button>

                {/* Previous Page */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next Page */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Next Page"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Last Page */}
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Last Page"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>

              {/* Right: Quick jump */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Go to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      goToPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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