
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.bookings': 'Bookings',
    'nav.chats': 'Chats',
    'nav.quotes': 'Quotes',
    'nav.profile': 'Profile',
    'nav.support': 'Support',
    
    // Onboarding
    'onboarding.welcome': 'Welcome to LocalEase',
    'onboarding.subtitle': 'Your trusted partner for local services',
    'onboarding.description': 'Book professional services for moving, cleaning, transport and more with just a few taps.',
    'onboarding.getStarted': 'Get Started',
    
    // Home
    'home.title': 'What service do you need?',
    'home.subtitle': 'Choose from our professional services',
    
    // Services
    'service.moving': 'Moving',
    'service.disposal': 'Disposal',
    'service.transport': 'Transport',
    'service.cleaning': 'Cleaning',
    'service.gardening': 'Gardening',
    
    // Moving Service
    'moving.title': 'Moving Service',
    'moving.requestQuote': 'Request a Quote',
    'moving.chooseSupplier': 'Choose a Supplier',
    'moving.selectRooms': 'Select Rooms',
    'moving.addItems': 'Add Items',
    'moving.dateTime': 'Date & Time',
    'moving.addresses': 'Addresses',
    'moving.contact': 'Contact Information',
    'moving.submit': 'Submit Request',
    'moving.from': 'From',
    'moving.to': 'To',
    
    // Disposal Service
    'disposal.title': 'Disposal Service',
    'disposal.selectItems': 'Select Items to Dispose',
    'disposal.uploadPhoto': 'Upload Photo (Optional)',
    'disposal.address': 'Pickup Address',
    
    // Transport Service
    'transport.title': 'Transport Service',
    'transport.pickup': 'Pickup Location',
    'transport.dropoff': 'Drop-off Location',
    'transport.notes': 'Additional Notes',
    
    // Common
    'common.next': 'Next',
    'common.back': 'Back',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.address': 'Address',
    'common.phone': 'Phone Number',
    'common.email': 'Email Address',
    'common.name': 'Full Name',
    'common.notes': 'Notes',
    
    // Rooms
    'room.kitchen': 'Kitchen',
    'room.bedroom': 'Bedroom',
    'room.livingRoom': 'Living Room',
    'room.bathroom': 'Bathroom',
    'room.office': 'Office',
    'room.garage': 'Garage',
    
    // Floors
    'floor.ground': 'Ground Floor',
    'floor.first': 'First Floor',
    'floor.second': 'Second Floor',
    'floor.basement': 'Basement',
    
    // Items
    'item.sofa': 'Sofa',
    'item.table': 'Table',
    'item.chair': 'Chair',
    'item.bed': 'Bed',
    'item.wardrobe': 'Wardrobe',
    'item.tv': 'TV',
    'item.fridge': 'Refrigerator',
    'item.washer': 'Washing Machine',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.bookings': 'Réservations',
    'nav.profile': 'Profil',
    'nav.support': 'Support',
    
    // Onboarding
    'onboarding.welcome': 'Bienvenue chez LocalEase',
    'onboarding.subtitle': 'Votre partenaire de confiance pour les services locaux',
    'onboarding.description': 'Réservez des services professionnels pour le déménagement, le nettoyage, le transport et plus encore en quelques clics.',
    'onboarding.getStarted': 'Commencer',
    
    // Home
    'home.title': 'De quel service avez-vous besoin?',
    'home.subtitle': 'Choisissez parmi nos services professionnels',
    
    // Services
    'service.moving': 'Déménagement',
    'service.disposal': 'Évacuation',
    'service.transport': 'Transport',
    'service.cleaning': 'Nettoyage',
    'service.gardening': 'Jardinage',
    
    // Moving Service
    'moving.title': 'Service de Déménagement',
    'moving.requestQuote': 'Demander un Devis',
    'moving.chooseSupplier': 'Choisir un Fournisseur',
    'moving.selectRooms': 'Sélectionner les Pièces',
    'moving.addItems': 'Ajouter des Objets',
    'moving.dateTime': 'Date et Heure',
    'moving.addresses': 'Adresses',
    'moving.contact': 'Informations de Contact',
    'moving.submit': 'Soumettre la Demande',
    'moving.from': 'De',
    'moving.to': 'À',
    
    // Disposal Service
    'disposal.title': 'Service d\'Évacuation',
    'disposal.selectItems': 'Sélectionner les Objets à Évacuer',
    'disposal.uploadPhoto': 'Télécharger une Photo (Optionnel)',
    'disposal.address': 'Adresse de Collecte',
    
    // Transport Service
    'transport.title': 'Service de Transport',
    'transport.pickup': 'Lieu de Collecte',
    'transport.dropoff': 'Lieu de Dépôt',
    'transport.notes': 'Notes Supplémentaires',
    
    // Common
    'common.next': 'Suivant',
    'common.back': 'Retour',
    'common.submit': 'Soumettre',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.date': 'Date',
    'common.time': 'Heure',
    'common.address': 'Adresse',
    'common.phone': 'Numéro de Téléphone',
    'common.email': 'Adresse Email',
    'common.name': 'Nom Complet',
    'common.notes': 'Notes',
    
    // Rooms
    'room.kitchen': 'Cuisine',
    'room.bedroom': 'Chambre',
    'room.livingRoom': 'Salon',
    'room.bathroom': 'Salle de Bain',
    'room.office': 'Bureau',
    'room.garage': 'Garage',
    
    // Floors
    'floor.ground': 'Rez-de-Chaussée',
    'floor.first': 'Premier Étage',
    'floor.second': 'Deuxième Étage',
    'floor.basement': 'Sous-sol',
    
    // Items
    'item.sofa': 'Canapé',
    'item.table': 'Table',
    'item.chair': 'Chaise',
    'item.bed': 'Lit',
    'item.wardrobe': 'Armoire',
    'item.tv': 'Télévision',
    'item.fridge': 'Réfrigérateur',
    'item.washer': 'Lave-linge',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.bookings': 'Buchungen',
    'nav.profile': 'Profil',
    'nav.support': 'Support',
    
    // Onboarding
    'onboarding.welcome': 'Willkommen bei LocalEase',
    'onboarding.subtitle': 'Ihr vertrauenswürdiger Partner für lokale Dienstleistungen',
    'onboarding.description': 'Buchen Sie professionelle Dienstleistungen für Umzüge, Reinigung, Transport und mehr mit nur wenigen Klicks.',
    'onboarding.getStarted': 'Loslegen',
    
    // Home
    'home.title': 'Welchen Service benötigen Sie?',
    'home.subtitle': 'Wählen Sie aus unseren professionellen Dienstleistungen',
    
    // Services
    'service.moving': 'Umzug',
    'service.disposal': 'Entsorgung',
    'service.transport': 'Transport',
    'service.cleaning': 'Reinigung',
    'service.gardening': 'Gartenarbeit',
    
    // Moving Service
    'moving.title': 'Umzugsservice',
    'moving.requestQuote': 'Angebot Anfordern',
    'moving.chooseSupplier': 'Anbieter Wählen',
    'moving.selectRooms': 'Räume Auswählen',
    'moving.addItems': 'Gegenstände Hinzufügen',
    'moving.dateTime': 'Datum und Uhrzeit',
    'moving.addresses': 'Adressen',
    'moving.contact': 'Kontaktinformationen',
    'moving.submit': 'Anfrage Senden',
    'moving.from': 'Von',
    'moving.to': 'Nach',
    
    // Disposal Service
    'disposal.title': 'Entsorgungsservice',
    'disposal.selectItems': 'Zu Entsorgende Gegenstände Auswählen',
    'disposal.uploadPhoto': 'Foto Hochladen (Optional)',
    'disposal.address': 'Abholadresse',
    
    // Transport Service
    'transport.title': 'Transportservice',
    'transport.pickup': 'Abholort',
    'transport.dropoff': 'Zielort',
    'transport.notes': 'Zusätzliche Notizen',
    
    // Common
    'common.next': 'Weiter',
    'common.back': 'Zurück',
    'common.submit': 'Senden',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.edit': 'Bearbeiten',
    'common.date': 'Datum',
    'common.time': 'Uhrzeit',
    'common.address': 'Adresse',
    'common.phone': 'Telefonnummer',
    'common.email': 'E-Mail-Adresse',
    'common.name': 'Vollständiger Name',
    'common.notes': 'Notizen',
    
    // Rooms
    'room.kitchen': 'Küche',
    'room.bedroom': 'Schlafzimmer',
    'room.livingRoom': 'Wohnzimmer',
    'room.bathroom': 'Badezimmer',
    'room.office': 'Büro',
    'room.garage': 'Garage',
    
    // Floors
    'floor.ground': 'Erdgeschoss',
    'floor.first': 'Erster Stock',
    'floor.second': 'Zweiter Stock',
    'floor.basement': 'Keller',
    
    // Items
    'item.sofa': 'Sofa',
    'item.table': 'Tisch',
    'item.chair': 'Stuhl',
    'item.bed': 'Bett',
    'item.wardrobe': 'Kleiderschrank',
    'item.tv': 'Fernseher',
    'item.fridge': 'Kühlschrank',
    'item.washer': 'Waschmaschine',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
