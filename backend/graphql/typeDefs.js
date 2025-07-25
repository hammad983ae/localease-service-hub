import { gql } from 'apollo-server-express';

export const typeDefs = gql`
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

  type Query {
    me: User
    myBookings: [MovingBooking]
    booking(id: ID!): MovingBooking
    allBookings: [MovingBooking]
    approvedBookings: [MovingBooking]
    rejectedBookings: [MovingBooking]
  }

  type Mutation {
    register(email: String!, password: String!, full_name: String, phone: String, address: String): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateProfile(full_name: String, phone: String, address: String): User
    createMovingBooking(
      rooms: [RoomInput],
      items: JSON,
      dateTime: Date,
      dateTimeFlexible: String,
      addresses: AddressInput,
      contact: ContactInput,
      company: CompanyInput
    ): MovingBooking
    approveBooking(id: ID!): MovingBooking
    rejectBooking(id: ID!): MovingBooking
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
`; 