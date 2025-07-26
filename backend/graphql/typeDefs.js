const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    id: ID!
    email: String!
    full_name: String
    phone: String
    address: String
    role: String
  }

  type Room {
    floor: String
    room: String
    count: Int
  }

  type Company {
    id: ID
    name: String
    email: String
    phone: String
    address: String
    description: String
    services: [String]
    priceRange: String
    companyType: String
    userId: ID!
    createdAt: Date
  }

  type MovingBooking {
    id: ID!
    userId: ID!
    rooms: [Room]
    items: JSON
    dateTime: Date
    dateTimeFlexible: String
    addresses: Address
    contact: Contact
    company: Company
    status: String
    createdAt: Date
  }

  type DisposalItem {
    type: String!
    description: String
    quantity: Int
    photos: [String]
    specialInstructions: String
  }

  type DisposalBooking {
    id: ID!
    userId: ID!
    serviceType: String!
    items: [DisposalItem]
    dateTime: Date
    dateTimeFlexible: String
    pickupAddress: PickupAddress
    contact: Contact
    company: Company
    status: String
    estimatedCost: Float
    createdAt: Date
  }

  type TransportItem {
    type: String!
    description: String
    dimensions: ItemDimensions
    quantity: Int
    specialInstructions: String
    fragile: Boolean
    insuranceRequired: Boolean
  }

  type ItemDimensions {
    length: Float
    width: Float
    height: Float
    weight: Float
  }

  type TransportBooking {
    id: ID!
    userId: ID!
    serviceType: String!
    items: [TransportItem]
    dateTime: Date
    dateTimeFlexible: String
    pickupLocation: Location
    dropoffLocation: Location
    contact: Contact
    company: Company
    status: String
    estimatedCost: Float
    estimatedTime: String
    createdAt: Date
  }

  type PickupAddress {
    street: String
    city: String
    state: String
    zipCode: String
    fullAddress: String
  }

  type Location {
    street: String
    city: String
    state: String
    zipCode: String
    fullAddress: String
    instructions: String
  }

  type Address {
    from: String
    to: String
  }

  type Contact {
    name: String
    email: String
    phone: String
    notes: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type UserProfile {
    id: ID!
    userId: ID!
    full_name: String
    phone: String
    address: String
    createdAt: Date
  }

  type ChatRoom {
    id: ID!
    bookingId: ID!
    bookingType: String!
    userId: ID!
    companyId: ID!
    isActive: Boolean!
    createdAt: Date
    updatedAt: Date
  }

  type Message {
    id: ID!
    chatRoomId: ID!
    senderId: ID!
    senderType: String!
    content: String!
    messageType: String!
    isRead: Boolean!
    createdAt: Date
  }

  type Query {
    me: User
    myProfile: UserProfile
    myBookings: [MovingBooking]
    myDisposalBookings: [DisposalBooking]
    myTransportBookings: [TransportBooking]
    booking(id: ID!): MovingBooking
    disposalBooking(id: ID!): DisposalBooking
    transportBooking(id: ID!): TransportBooking
    allBookings: [MovingBooking]
    allDisposalBookings: [DisposalBooking]
    allTransportBookings: [TransportBooking]
    approvedBookings: [MovingBooking]
    approvedDisposalBookings: [DisposalBooking]
    approvedTransportBookings: [TransportBooking]
    rejectedBookings: [MovingBooking]
    rejectedDisposalBookings: [DisposalBooking]
    rejectedTransportBookings: [TransportBooking]
    allCompanies: [Company]
    companyBookings: [MovingBooking]
    companyDisposalBookings: [DisposalBooking]
    companyTransportBookings: [TransportBooking]
    myChatRooms: [ChatRoom]
    companyChatRooms: [ChatRoom]
    chatRoom(id: ID!): ChatRoom
    chatMessages(chatRoomId: ID!): [Message]
  }

  type Mutation {
    register(email: String!, password: String!, full_name: String, phone: String, address: String, role: String): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateProfile(full_name: String, phone: String, address: String): User
    updateUserProfile(full_name: String, phone: String, address: String): UserProfile
    createMovingBooking(
      rooms: [RoomInput],
      items: JSON,
      dateTime: Date,
      dateTimeFlexible: String,
      addresses: AddressInput,
      contact: ContactInput,
      company: CompanyInput
    ): MovingBooking
    createDisposalBooking(
      serviceType: String!,
      items: [DisposalItemInput],
      dateTime: Date,
      dateTimeFlexible: String,
      pickupAddress: PickupAddressInput,
      contact: ContactInput,
      company: CompanyInput
    ): DisposalBooking
    createTransportBooking(
      serviceType: String!,
      items: [TransportItemInput],
      dateTime: Date,
      dateTimeFlexible: String,
      pickupLocation: LocationInput,
      dropoffLocation: LocationInput,
      contact: ContactInput,
      company: CompanyInput
    ): TransportBooking
    approveBooking(id: ID!): MovingBooking
    rejectBooking(id: ID!): MovingBooking
    approveDisposalBooking(id: ID!): DisposalBooking
    rejectDisposalBooking(id: ID!): DisposalBooking
    approveTransportBooking(id: ID!): TransportBooking
    rejectTransportBooking(id: ID!): TransportBooking
    companyApproveBooking(id: ID!): MovingBooking
    companyRejectBooking(id: ID!): MovingBooking
    companyApproveDisposalBooking(id: ID!): DisposalBooking
    companyRejectDisposalBooking(id: ID!): DisposalBooking
    companyApproveTransportBooking(id: ID!): TransportBooking
    companyRejectTransportBooking(id: ID!): TransportBooking
    createCompanyProfile(name: String!, email: String!, phone: String, address: String, description: String, services: [String!], priceRange: String, companyType: String): Company
    createChatRoom(bookingId: ID!, bookingType: String!): ChatRoom
    sendMessage(chatRoomId: ID!, content: String!, messageType: String): Message
    markMessageAsRead(messageId: ID!): Message
  }

  type Subscription {
    messageAdded(chatRoomId: ID!): Message
    messageRead(messageId: ID!): Message
  }

  input RoomInput {
    floor: String
    room: String
    count: Int
  }

  input AddressInput {
    from: String
    to: String
  }

  input ContactInput {
    name: String
    email: String
    phone: String
    notes: String
  }

  input CompanyInput {
    id: String
    name: String
    description: String
    rating: Float
    total_reviews: Int
    location: String
    services: [String]
    price_range: String
    image_url: String
    contact_phone: String
    contact_email: String
  }

  input DisposalItemInput {
    type: String!
    description: String
    quantity: Int
    photos: [String]
    specialInstructions: String
  }

  input TransportItemInput {
    type: String!
    description: String
    dimensions: ItemDimensionsInput
    quantity: Int
    specialInstructions: String
    fragile: Boolean
    insuranceRequired: Boolean
  }

  input ItemDimensionsInput {
    length: Float
    width: Float
    height: Float
    weight: Float
  }

  input PickupAddressInput {
    street: String
    city: String
    state: String
    zipCode: String
    fullAddress: String
  }

  input LocationInput {
    street: String
    city: String
    state: String
    zipCode: String
    fullAddress: String
    instructions: String
  }
`;

module.exports = { typeDefs }; 