import prisma from "../../config/prisma";

export const fetchLocations = async () => {
  const locations = await prisma.location.findMany({
    select: {
      id: true,
      locationName: true,
      zipcode: true,
      dentalUnits: true,
    },
    orderBy: { locationName: "asc" },
  });

  return locations;
};
