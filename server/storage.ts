import {
  users,
  courts,
  bookings,
  notifications,
  settings,
  type User,
  type UpsertUser,
  type Court,
  type InsertCourt,
  type Booking,
  type InsertBooking,
  type Notification,
  type InsertNotification,
  type Setting,
  type InsertSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;
  
  // Court operations
  getAllCourts(): Promise<Court[]>;
  getActiveCourts(): Promise<Court[]>;
  getCourt(id: number): Promise<Court | undefined>;
  createCourt(court: InsertCourt): Promise<Court>;
  updateCourt(id: number, updates: Partial<InsertCourt>): Promise<Court>;
  deleteCourt(id: number): Promise<void>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getCourtBookings(courtId: number, startDate: Date, endDate: Date): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string, metadata?: any): Promise<Booking>;
  cancelBooking(id: string, reason: string, refundAmount?: string): Promise<Booking>;
  startSession(id: string): Promise<Booking>;
  endSession(id: string): Promise<Booking>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<Notification>;
  markAllNotificationsRead(userId: string): Promise<void>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscriptionId ? "active" : "inactive",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Court operations
  async getAllCourts(): Promise<Court[]> {
    return db.select().from(courts).orderBy(asc(courts.name));
  }

  async getActiveCourts(): Promise<Court[]> {
    return db.select().from(courts).where(eq(courts.isActive, true)).orderBy(asc(courts.name));
  }

  async getCourt(id: number): Promise<Court | undefined> {
    const [court] = await db.select().from(courts).where(eq(courts.id, id));
    return court;
  }

  async createCourt(courtData: InsertCourt): Promise<Court> {
    const [court] = await db.insert(courts).values(courtData).returning();
    return court;
  }

  async updateCourt(id: number, updates: Partial<InsertCourt>): Promise<Court> {
    const [court] = await db
      .update(courts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courts.id, id))
      .returning();
    return court;
  }

  async deleteCourt(id: number): Promise<void> {
    await db.update(courts).set({ isActive: false }).where(eq(courts.id, id));
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.startTime));
  }

  async getCourtBookings(courtId: number, startDate: Date, endDate: Date): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          gte(bookings.startTime, startDate),
          lte(bookings.endTime, endDate),
          eq(bookings.status, "confirmed")
        )
      )
      .orderBy(asc(bookings.startTime));
  }

  async updateBookingStatus(id: string, status: string, metadata?: any): Promise<Booking> {
    const updateData: any = { status, updatedAt: new Date() };
    if (metadata) {
      Object.assign(updateData, metadata);
    }
    
    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async cancelBooking(id: string, reason: string, refundAmount?: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        cancellationReason: reason,
        refundAmount: refundAmount,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async startSession(id: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        status: "active",
        sessionStartedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async endSession(id: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        status: "completed",
        sessionEndedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async setSetting(settingData: InsertSetting): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values(settingData)
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: settingData.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }
}

export const storage = new DatabaseStorage();
