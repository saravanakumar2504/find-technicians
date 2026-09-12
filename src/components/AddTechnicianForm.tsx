'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/hooks';
import { addTechnician } from '@/lib/features/technicians/techniciansSlice';

export function AddTechnicianForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [availabilityTime, setAvailabilityTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      addTechnician({
        id: Date.now().toString(),
        name,
        phone,
        address,
        availabilityTime,
        specialty: '',
        rating: 0,
        available: true,
        location: address,
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

      <button type="submit">Add Technician</button>
    </form>
  );
}
