'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchTechnicians, toggleSpecialtyFilter, toggleAvailability } from '@/lib/features/technicians/techniciansSlice';
import { SPECIALTY_FILTER_OPTIONS } from '@/lib/constants/specialties';

export function TechnicianList() {
  const dispatch = useAppDispatch();
  const { items, status, error, filterSpecialties } = useAppSelector((state) => state.technicians);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTechnicians());
    }
  }, [status, dispatch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAllSelected = filterSpecialties.includes('all');

  const filteredItems = isAllSelected
    ? items
    : items.filter((t) => filterSpecialties.includes(t.specialty));

  const filterSummary = isAllSelected
    ? 'All Specialties'
    : `${filterSpecialties.length} Selected`;

  if (status === 'loading') {
    return <div className="loading">Loading technicians...</div>;
  }

  if (status === 'failed') {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="technician-container">
      <h2>Available Technicians</h2>

      <div className="filter-section" ref={filterRef}>
        <span className="filter-label">Filter by Specialty:</span>
        <div className="specialty-filter">
          <button
            type="button"
            className="specialty-filter-trigger"
            onClick={() => setIsFilterOpen((open) => !open)}
          >
            {filterSummary} <span className="chevron">▾</span>
          </button>

          {isFilterOpen && (
            <div className="specialty-filter-menu">
              {SPECIALTY_FILTER_OPTIONS.map((spec) => {
                const isChecked = spec === 'all' ? isAllSelected : filterSpecialties.includes(spec);
                return (
                  <label key={spec} className="specialty-filter-option">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => dispatch(toggleSpecialtyFilter(spec))}
                    />
                    {spec === 'all' ? 'All' : spec}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="table-scroll">
        <table className="technicians-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Availability Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((tech) => (
              <tr key={tech.id}>
                <td>{tech.name}</td>
                <td>{tech.phone}</td>
                <td>{tech.address}</td>
                <td>{tech.availabilityTime}</td>
                <td className={`status ${tech.available ? 'available' : 'busy'}`}>
                  {tech.available ? '🟢 Available' : '🔴 Busy'}
                </td>
                <td>
                  <div className="action-group">
                    <button
                      onClick={() => dispatch(toggleAvailability(tech.id))}
                      className={`toggle-btn ${tech.available ? 'toggle-btn--busy' : 'toggle-btn--available'}`}
                      title={tech.available ? 'Mark this technician as busy' : 'Mark this technician as available'}
                    >
                      {tech.available ? 'Mark Busy' : 'Mark Available'}
                    </button>
                    <Link href={`/edit/${tech.id}`} className="edit-btn" title="Edit technician details">
                      ✏️ Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
