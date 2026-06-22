import { db } from "@/lib/db";

export async function getPublishedCourses() {
  return db.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      duration: true,
      orderDetails: true,
      themeColor: true,
      imageFileName: true,
      imageMimeType: true,
    },
  });
}

export async function getPublishedCourseById(id: string) {
  return db.course.findFirst({
    where: { id, published: true },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      duration: true,
      orderDetails: true,
      themeColor: true,
      imageFileName: true,
      imageMimeType: true,
    },
  });
}

export async function getPublishedBookById(id: string) {
  return db.book.findFirst({
    where: { id, published: true },
    select: {
      id: true,
      title: true,
      description: true,
      author: true,
      price: true,
      inStock: true,
      orderDetails: true,
      coverFileName: true,
      coverMimeType: true,
    },
  });
}

export async function getPublishedBooks() {
  return db.book.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      author: true,
      price: true,
      inStock: true,
      orderDetails: true,
      coverFileName: true,
      coverMimeType: true,
    },
  });
}

export async function getPublishedSuccessStories() {
  return db.successStory.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      role: true,
      quote: true,
      batch: true,
      profileFileName: true,
      profileMimeType: true,
    },
  });
}

export function hasCourseImage(course: {
  imageFileName: string | null;
  imageMimeType: string | null;
}) {
  return Boolean(course.imageFileName && course.imageMimeType);
}

export function hasBookCover(book: {
  coverFileName: string | null;
  coverMimeType: string | null;
}) {
  return Boolean(book.coverFileName && book.coverMimeType);
}

export function hasStoryProfile(story: {
  profileFileName: string | null;
  profileMimeType: string | null;
}) {
  return Boolean(story.profileFileName && story.profileMimeType);
}
