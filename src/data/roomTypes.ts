export type RoomCatalogItem = {
  id: string;
  label: string;
  icon: string;
  category: 'residential' | 'commercial' | 'utility' | 'outdoor' | 'office';
};

// Comprehensive list of room types for moving flow
export const ROOM_CATALOG: RoomCatalogItem[] = [
  { id: 'bedroom', label: 'Bedroom', icon: '🛏️', category: 'residential' },
  { id: 'livingRoom', label: 'Living room', icon: '🛋️', category: 'residential' },
  { id: 'kitchen', label: 'Kitchen', icon: '🍳', category: 'residential' },
  { id: 'bathroom', label: 'Bathroom', icon: '🚿', category: 'residential' },
  { id: 'diningRoom', label: 'Dining room', icon: '🍽️', category: 'residential' },
  { id: 'guestRoom', label: 'Guest room', icon: '🛏️', category: 'residential' },
  { id: 'childrensRoom', label: "Children's room / Kid's bedroom", icon: '🧸', category: 'residential' },
  { id: 'dressingRoom', label: 'Dressing room / Walk-in closet', icon: '👗', category: 'residential' },
  { id: 'homeOffice', label: 'Home office / Study', icon: '🧑‍💻', category: 'residential' },
  { id: 'laundryRoom', label: 'Laundry room', icon: '🧺', category: 'utility' },
  { id: 'pantryStorage', label: 'Storage room / Pantry / Supply room', icon: '📦', category: 'utility' },
  { id: 'utilityRoom', label: 'Utility room', icon: '🧰', category: 'utility' },
  { id: 'hallwayCorridor', label: 'Hallway / Corridor', icon: '🚪', category: 'residential' },
  { id: 'balcony', label: 'Balcony', icon: '🌇', category: 'outdoor' },
  { id: 'patioTerrace', label: 'Patio / Terrace', icon: '🏖️', category: 'outdoor' },
  { id: 'gardenShed', label: 'Garden shed', icon: '🏚️', category: 'outdoor' },
  { id: 'garage', label: 'Garage', icon: '🚗', category: 'utility' },
  { id: 'atticLoft', label: 'Attic / Loft', icon: '🪜', category: 'utility' },
  { id: 'basementCellar', label: 'Basement / Cellar', icon: '🏠', category: 'utility' },
  { id: 'coldStorage', label: 'Cold storage room', icon: '❄️', category: 'utility' },
  { id: 'libraryReadingRoom', label: 'Library / Reading room', icon: '📚', category: 'residential' },
  { id: 'musicRoomStudio', label: 'Music room / Studio', icon: '🎵', category: 'residential' },
  { id: 'gymFitnessRoom', label: 'Gym / Fitness room', icon: '💪', category: 'residential' },
  
  // Office / Commercial
  { id: 'office', label: 'Office', icon: '💼', category: 'office' },
  { id: 'archiveFilingRoom', label: 'Archive room / Filing room', icon: '🗄️', category: 'office' },
  { id: 'breakStaffRoom', label: 'Break room / Staff room', icon: '☕', category: 'office' },
  { id: 'conferenceMeetingRoom', label: 'Conference room / Meeting room', icon: '👥', category: 'office' },
  { id: 'receptionArea', label: 'Reception area', icon: '🛎️', category: 'office' },
  { id: 'serverItRoom', label: 'Server room / IT room', icon: '🖥️', category: 'office' },
  { id: 'showroom', label: 'Showroom', icon: '🛍️', category: 'commercial' },
  { id: 'exhibitionSpace', label: 'Exhibition space', icon: '🖼️', category: 'commercial' },
  { id: 'productionArea', label: 'Production area', icon: '🏭', category: 'commercial' },
  { id: 'laboratory', label: 'Laboratory', icon: '⚗️', category: 'commercial' },
  { id: 'waitingRoom', label: 'Waiting room', icon: '⏳', category: 'office' },
  { id: 'warehouse', label: 'Warehouse', icon: '📦', category: 'commercial' },
  { id: 'workshop', label: 'Workshop', icon: '🔧', category: 'commercial' },
];
