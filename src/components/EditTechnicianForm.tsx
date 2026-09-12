'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchTechnicians, updateTechnician } from '@/lib/features/technicians/techniciansSlice';

export function EditTechnicianForm({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status } = useAppSelector((state) => state.technicians);
  const technician = items.find((t) => t.id === id);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [availabilityTime, setAvailabilityTime] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTechnicians());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (technician) {
      setName(technician.name);
      setPhone(technician.phone);
      setAddress(technician.address);
      setAvailabilityTime(technician.availabilityTime);
    }
  }, [technician]);

  if (status === 'loading' || status === 'idle') {
    return <p>Loading...</p>;
  }

  if (!technician) {
    return <p>Technician not found.</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateTechnician({
        ...technician,
        name,
        phone,
        address,
        availabilityTime,
      })
    );
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="technician-form">
      <label htmlFor="name">Name</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />

      <label htmlFor="phone">Phone</label>
      <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />

      <label htmlFor="address">Address</label>
      <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />

      <label htmlFor="availabilityTime">Availability Time</label>
      <input
        id="availabilityTime"
        value={availabilityTime}
        onChange={(e) => setAvailabilityTime(e.target.value)}
        required
      />

      <button type="submit">Save Changes</button>
    </form>
  );
}
