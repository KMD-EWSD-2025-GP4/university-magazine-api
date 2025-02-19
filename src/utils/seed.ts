// generate faculties

import { faculty } from '../db/schema';
import { db } from '../db/';
const faculties = [
  {
    name: 'Faculty of Science',
  },
  {
    name: 'Faculty of Engineering',
  },
  {
    name: 'Faculty of Business',
  },
  {
    name: 'Faculty of Arts',
  },
  {
    name: 'Faculty of Law',
  },
  {
    name: 'Faculty of Medicine',
  },
  {
    name: 'Faculty of Education',
  },
];

export const generateFaculties = async () => {
  faculties.forEach(async (item) => {
    await db.insert(faculty).values(item);
  });
};
