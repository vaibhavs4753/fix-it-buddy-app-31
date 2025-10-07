import { pgTable, uuid, text, decimal, boolean, timestamp, integer, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const serviceTypeEnum = pgEnum('service_type', ['electrician', 'mechanic', 'plumber']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'accepted', 'completed', 'cancelled', 'in_progress']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'audio', 'none']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'online', 'card', 'upi']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const urgencyEnum = pgEnum('urgency', ['low', 'medium', 'high', 'emergency']);
export const userRoleEnum = pgEnum('user_role', ['customer', 'technician', 'admin']);
export const availabilityStatusEnum = pgEnum('availability_status', ['available', 'busy', 'offline']);
export const sessionStatusEnum = pgEnum('session_status', ['active', 'paused', 'completed', 'cancelled']);
export const categoryEnum = pgEnum('category', ['electrical', 'plumbing', 'mechanical', 'other', 'service_fee']);
export const locationStatusEnum = pgEnum('location_status', ['active', 'inactive', 'offline']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('customer'),
  email: text('email'),
  activeRole: text('active_role').default('customer'),
  availableRoles: text('available_roles').array().default(['customer']),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Technician profiles table
export const technicianProfiles = pgTable('technician_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  serviceType: serviceTypeEnum('service_type').notNull(),
  description: text('description'),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('4.5'),
  isAvailable: boolean('is_available').default(true),
  currentLocationLat: decimal('current_location_lat', { precision: 10, scale: 8 }),
  currentLocationLng: decimal('current_location_lng', { precision: 11, scale: 8 }),
  profileImageUrl: text('profile_image_url'),
  experienceYears: integer('experience_years').default(0),
  availabilityStatus: availabilityStatusEnum('availability_status').default('available'),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('10.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: uniqueIndex('technician_profiles_user_id_idx').on(table.userId),
  serviceTypeIdx: index('idx_technician_profiles_service_type').on(table.serviceType),
  availabilityIdx: index('idx_technician_profiles_availability').on(table.availabilityStatus),
}));

// Services table
// Note: Using categoryEnum with 'service_fee' to support all inserted values from migrations
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  category: categoryEnum('category').notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service requests table
export const serviceRequests = pgTable('service_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  technicianId: uuid('technician_id').references(() => users.id, { onDelete: 'set null' }),
  serviceId: uuid('service_id').references(() => services.id),
  serviceType: serviceTypeEnum('service_type').notNull(),
  description: text('description').notNull(),
  mediaUrls: text('media_urls').array().default([]),
  mediaType: mediaTypeEnum('media_type').default('none'),
  status: requestStatusEnum('status').default('pending'),
  locationLat: decimal('location_lat', { precision: 10, scale: 8 }).notNull(),
  locationLng: decimal('location_lng', { precision: 11, scale: 8 }).notNull(),
  locationAddress: text('location_address').notNull(),
  paymentMethod: paymentMethodEnum('payment_method'),
  isVisitRequired: boolean('is_visit_required').default(false),
  scheduledTime: timestamp('scheduled_time'),
  urgency: urgencyEnum('urgency').default('medium'),
  estimatedPrice: decimal('estimated_price', { precision: 10, scale: 2 }),
  actualPrice: decimal('actual_price', { precision: 10, scale: 2 }),
  trackingEnabled: boolean('tracking_enabled').default(false),
  estimatedArrival: timestamp('estimated_arrival'),
  distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
  travelTimeMinutes: integer('travel_time_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('idx_service_requests_client_id').on(table.clientId),
  technicianIdIdx: index('idx_service_requests_technician_id').on(table.technicianId),
  statusIdx: index('idx_service_requests_status').on(table.status),
  trackingIdx: index('idx_service_requests_tracking').on(table.trackingEnabled, table.status),
}));

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceRequestId: uuid('service_request_id').references(() => serviceRequests.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull(),
  technicianId: uuid('technician_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('usd'),
  paymentMethod: paymentMethodEnum('payment_method'),
  status: paymentStatusEnum('status').default('pending'),
  stripeSessionId: text('stripe_session_id'),
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),
  paymentGateway: text('payment_gateway').default('razorpay'),
  failureReason: text('failure_reason'),
  refundId: text('refund_id'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  paymentCaptured: boolean('payment_captured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  serviceRequestIdx: index('idx_payments_service_request').on(table.serviceRequestId),
  razorpayIdx: index('idx_payments_razorpay').on(table.razorpayOrderId, table.razorpayPaymentId),
}));

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceRequestId: uuid('service_request_id').references(() => serviceRequests.id, { onDelete: 'cascade' }).unique(),
  customerId: uuid('customer_id').notNull(),
  technicianId: uuid('technician_id').notNull(),
  rating: integer('rating'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  technicianIdx: index('idx_reviews_technician').on(table.technicianId),
}));

// Service sessions table
export const serviceSessions = pgTable('service_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceRequestId: uuid('service_request_id').notNull(),
  technicianId: uuid('technician_id').notNull(),
  clientId: uuid('client_id').notNull(),
  status: sessionStatusEnum('status').notNull().default('active'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  technicianStatusIdx: index('idx_service_sessions_technician_status').on(table.technicianId, table.status),
  clientStatusIdx: index('idx_service_sessions_client_status').on(table.clientId, table.status),
}));

// Location history table
export const locationHistory = pgTable('location_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceSessionId: uuid('service_session_id'),
  technicianId: uuid('technician_id').notNull(),
  lat: decimal('lat').notNull(),
  lng: decimal('lng').notNull(),
  accuracy: decimal('accuracy'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdx: index('idx_location_history_session').on(table.serviceSessionId),
  technicianTimeIdx: index('idx_location_history_technician_time').on(table.technicianId, table.recordedAt),
}));

// Technician real-time location table
export const technicianLocationRealTime = pgTable('technician_location_real_time', {
  id: uuid('id').primaryKey().defaultRandom(),
  technicianId: uuid('technician_id').notNull(),
  lat: decimal('lat', { precision: 10, scale: 8 }).notNull(),
  lng: decimal('lng', { precision: 11, scale: 8 }).notNull(),
  accuracy: integer('accuracy'),
  heading: decimal('heading', { precision: 5, scale: 2 }),
  speed: decimal('speed', { precision: 6, scale: 2 }),
  status: locationStatusEnum('status').notNull().default('active'),
  batteryLevel: integer('battery_level'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  technicianIdIdx: index('idx_technician_location_real_time_technician_id').on(table.technicianId),
  updatedAtIdx: index('idx_technician_location_real_time_updated_at').on(table.updatedAt),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.id] }),
  technicianProfile: one(technicianProfiles, { fields: [users.id], references: [technicianProfiles.userId] }),
  clientRequests: many(serviceRequests, { relationName: 'clientRequests' }),
  technicianRequests: many(serviceRequests, { relationName: 'technicianRequests' }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
}));

export const technicianProfilesRelations = relations(technicianProfiles, ({ one }) => ({
  user: one(users, { fields: [technicianProfiles.userId], references: [users.id] }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
  client: one(users, { fields: [serviceRequests.clientId], references: [users.id], relationName: 'clientRequests' }),
  technician: one(users, { fields: [serviceRequests.technicianId], references: [users.id], relationName: 'technicianRequests' }),
  service: one(services, { fields: [serviceRequests.serviceId], references: [services.id] }),
  payments: many(payments),
  reviews: many(reviews),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  serviceRequest: one(serviceRequests, { fields: [payments.serviceRequestId], references: [serviceRequests.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  serviceRequest: one(serviceRequests, { fields: [reviews.serviceRequestId], references: [serviceRequests.id] }),
}));
