import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface Technician {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: boolean;
  location: string;
  phone: string;
  address: string;
  availabilityTime: string;
}

interface TechniciansState {
  items: Technician[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filterSpecialties: string[];
}

const mockTechnicians: Technician[] = [
  { id: '1', name: 'Karthikeyan Murugan', specialty: 'HVAC Specialist', rating: 4.8, available: true, location: 'Chennai, Tamil Nadu', phone: '(044) 555-0101', address: '24 Anna Salai, Chennai, Tamil Nadu', availabilityTime: 'Mon-Fri, 9am-5pm' },
  { id: '2', name: 'Meenakshi Sundaram', specialty: 'Electrician', rating: 4.9, available: true, location: 'Coimbatore, Tamil Nadu', phone: '(0422) 555-0102', address: '12 Race Course Road, Coimbatore, Tamil Nadu', availabilityTime: 'Mon-Sat, 8am-6pm' },
  { id: '3', name: 'Selvakumar Rajendran', specialty: 'Plumber', rating: 4.7, available: false, location: 'Madurai, Tamil Nadu', phone: '(0452) 555-0103', address: '8 Tallakulam, Madurai, Tamil Nadu', availabilityTime: 'Tue-Sat, 10am-4pm' },
  { id: '4', name: 'Priyadharshini Kannan', specialty: 'Network Technician', rating: 4.95, available: true, location: 'Trichy, Tamil Nadu', phone: '(0431) 555-0104', address: '45 Cantonment, Trichy, Tamil Nadu', availabilityTime: 'Mon-Fri, 7am-3pm' },
  { id: '5', name: 'Muthu Vijayan', specialty: 'Carpenter', rating: 4.6, available: true, location: 'Salem, Tamil Nadu', phone: '(0427) 555-0105', address: '17 Fort Main Road, Salem, Tamil Nadu', availabilityTime: 'Mon-Sat, 9am-6pm' },
  { id: '6', name: 'Kavitha Elango', specialty: 'Painter', rating: 4.85, available: false, location: 'Tirunelveli, Tamil Nadu', phone: '(0462) 555-0106', address: '9 Palayamkottai Road, Tirunelveli, Tamil Nadu', availabilityTime: 'Wed-Sun, 10am-5pm' },
  { id: '7', name: 'Ramesh Palanisamy', specialty: 'AC Repair Technician', rating: 4.75, available: true, location: 'Erode, Tamil Nadu', phone: '(0424) 555-0107', address: '3 Perundurai Road, Erode, Tamil Nadu', availabilityTime: 'Mon-Fri, 8am-4pm' },
  { id: '8', name: 'Lakshmi Narayanan', specialty: 'Appliance Repair Technician', rating: 4.65, available: true, location: 'Vellore, Tamil Nadu', phone: '(0416) 555-0108', address: '22 Officers Line, Vellore, Tamil Nadu', availabilityTime: 'Tue-Sun, 9am-5pm' },
  { id: '9', name: 'Suresh Kumaran', specialty: 'HVAC Specialist', rating: 4.9, available: false, location: 'Thanjavur, Tamil Nadu', phone: '(04362) 555-0109', address: '5 Big Bazaar Street, Thanjavur, Tamil Nadu', availabilityTime: 'Mon-Fri, 9am-6pm' },
  { id: '10', name: 'Devi Chandrasekaran', specialty: 'Electrician', rating: 4.8, available: true, location: 'Dindigul, Tamil Nadu', phone: '(0451) 555-0110', address: '14 Begampur, Dindigul, Tamil Nadu', availabilityTime: 'Mon-Sat, 8am-5pm' },
  { id: '11', name: 'Anbarasu Thangavel', specialty: 'Plumber', rating: 4.7, available: true, location: 'Karur, Tamil Nadu', phone: '(04324) 555-0111', address: '31 Kovai Road, Karur, Tamil Nadu', availabilityTime: 'Mon-Fri, 10am-6pm' },
  { id: '12', name: 'Saraswathi Manickam', specialty: 'Network Technician', rating: 4.88, available: false, location: 'Namakkal, Tamil Nadu', phone: '(04286) 555-0112', address: '6 Trichy Road, Namakkal, Tamil Nadu', availabilityTime: 'Tue-Sat, 9am-5pm' },
  { id: '13', name: 'Gopinath Subramaniam', specialty: 'Carpenter', rating: 4.6, available: true, location: 'Tiruppur, Tamil Nadu', phone: '(0421) 555-0113', address: '19 Kumaran Road, Tiruppur, Tamil Nadu', availabilityTime: 'Mon-Sat, 9am-6pm' },
  { id: '14', name: 'Valarmathi Ravichandran', specialty: 'Painter', rating: 4.7, available: true, location: 'Nagercoil, Tamil Nadu', phone: '(04652) 555-0114', address: '27 Vadasery, Nagercoil, Tamil Nadu', availabilityTime: 'Wed-Mon, 10am-5pm' },
  { id: '15', name: 'Balamurugan Sivakumar', specialty: 'AC Repair Technician', rating: 4.82, available: true, location: 'Kanchipuram, Tamil Nadu', phone: '(044) 555-0115', address: '10 Gandhi Road, Kanchipuram, Tamil Nadu', availabilityTime: 'Mon-Fri, 9am-5pm' },
];

export const fetchTechnicians = createAsyncThunk('technicians/fetchTechnicians', async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockTechnicians;
});

const initialState: TechniciansState = {
  items: [],
  status: 'idle',
  error: null,
  filterSpecialties: ['all'],
};

export const techniciansSlice = createSlice({
  name: 'technicians',
  initialState,
  reducers: {
    toggleSpecialtyFilter: (state, action: PayloadAction<string>) => {
      const specialty = action.payload;

      if (specialty === 'all') {
        state.filterSpecialties = ['all'];
        return;
      }

      const withoutAll = state.filterSpecialties.filter((s) => s !== 'all');
      const isSelected = withoutAll.includes(specialty);
      const next = isSelected
        ? withoutAll.filter((s) => s !== specialty)
        : [...withoutAll, specialty];

      state.filterSpecialties = next.length === 0 ? ['all'] : next;
    },
    toggleAvailability: (state, action: PayloadAction<string>) => {
      const tech = state.items.find((t) => t.id === action.payload);
      if (tech) {
        tech.available = !tech.available;
      }
    },
    updateTechnician: (state, action: PayloadAction<Technician>) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    addTechnician: (state, action: PayloadAction<Technician>) => {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechnicians.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTechnicians.fulfilled, (state, action: PayloadAction<Technician[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Failed to fetch technicians';
      });
  },
});

export const { toggleSpecialtyFilter, toggleAvailability, updateTechnician, addTechnician } = techniciansSlice.actions;

export default techniciansSlice.reducer;
