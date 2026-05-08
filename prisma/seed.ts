import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

const MOVIES = [
  {
    title: 'Dune: Part Two',
    genre: ['Sci-Fi', 'Action', 'Drama'],
    rating: 8.5,
    releaseDate: '2024-03-01',
    duration: 166,
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin', 'Austin Butler', 'Florence Pugh'],
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    language: 'English',
    price: 90,
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
  },
  {
    title: 'Oppenheimer',
    genre: ['Drama', 'History', 'Thriller'],
    rating: 8.9,
    releaseDate: '2023-07-21',
    duration: 180,
    description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II. A breathtaking look at the man who changed the world forever, and the moral weight that came with it.",
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh', 'Josh Hartnett'],
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    language: 'English',
    price: 95,
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
  },
  {
    title: 'The Batman',
    genre: ['Action', 'Thriller', 'Crime'],
    rating: 7.8,
    releaseDate: '2022-03-04',
    duration: 176,
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement.",
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Jeffrey Wright', 'John Turturro', 'Colin Farrell'],
    poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    language: 'English',
    price: 85,
    trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
  },
  {
    title: 'Poor Things',
    genre: ['Drama', 'Romance', 'Fantasy'],
    rating: 8.0,
    releaseDate: '2023-12-08',
    duration: 141,
    description: 'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.',
    cast: ['Emma Stone', 'Mark Ruffalo', 'Willem Dafoe', 'Ramy Youssef', 'Christopher Abbott'],
    poster: 'https://image.tmdb.org/t/p/w500/jFeOCkQKFYLJJZyFLGMQQ5KFKLD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/jWc8BMFZK7JkMw5NmkJhh4RXBGB.jpg',
    language: 'English',
    price: 80,
    trailerUrl: 'https://www.youtube.com/watch?v=RlbR5N6veqw',
  },
  {
    title: 'Wonka',
    genre: ['Fantasy', 'Comedy', 'Family'],
    rating: 7.2,
    releaseDate: '2023-12-15',
    duration: 116,
    description: "Based on the extraordinary character at the center of Charlie and the Chocolate Factory, this tells the story of how the world's greatest inventor and chocolate-maker became the beloved Willy Wonka we know today.",
    cast: ['Timothée Chalamet', 'Calah Lane', 'Keegan-Michael Key', 'Paterson Joseph', 'Matt Lucas'],
    poster: 'https://image.tmdb.org/t/p/w500/eCIvqa3QVCx6H1epkLYKGm9wVLO.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/yrpPYKijwBDNBOoMOCBMWqAzGlm.jpg',
    language: 'English',
    price: 75,
    trailerUrl: 'https://www.youtube.com/watch?v=otNh9bTjXWg',
  },
  {
    title: 'Interstellar',
    genre: ['Sci-Fi', 'Drama', 'Action'],
    rating: 8.7,
    releaseDate: '2014-11-07',
    duration: 169,
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival. One of the most visually stunning and emotionally powerful sci-fi films ever made.',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine', 'Matt Damon'],
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/pbrkL804Y8aIwMPbzHkO5FBBdlB.jpg',
    language: 'English',
    price: 85,
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  },
  {
    title: 'Inception',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    rating: 8.8,
    releaseDate: '2010-07-16',
    duration: 148,
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy', 'Ken Watanabe'],
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/s2bT2kajrhrm1e0HMa9tNPLYfGp.jpg',
    language: 'English',
    price: 85,
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
  },
  {
    title: 'Joker',
    genre: ['Drama', 'Crime', 'Thriller'],
    rating: 8.4,
    releaseDate: '2019-10-04',
    duration: 122,
    description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.',
    cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz', 'Frances Conroy', 'Brett Cullen'],
    poster: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg',
    language: 'English',
    price: 80,
    trailerUrl: 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
  },
  {
    title: 'The Godfather',
    genre: ['Crime', 'Drama'],
    rating: 9.2,
    releaseDate: '1972-03-24',
    duration: 175,
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son. A timeless masterpiece of American cinema.',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan', 'Richard Castellano', 'Robert Duvall'],
    poster: 'https://image.tmdb.org/t/p/w500/eEslKSwcqmiNS6va24Pbxf2UKmJ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
    language: 'English',
    price: 80,
    trailerUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
  },
  {
    title: 'Parasite',
    genre: ['Drama', 'Thriller', 'Comedy'],
    rating: 8.5,
    releaseDate: '2019-10-11',
    duration: 132,
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    language: 'Korean',
    price: 75,
    trailerUrl: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
  },
  {
    title: 'Avengers: Endgame',
    genre: ['Action', 'Sci-Fi', 'Drama'],
    rating: 8.4,
    releaseDate: '2019-04-26',
    duration: 181,
    description: "After the devastating events of Infinity War, the universe is in ruins. The Avengers assemble once more to reverse Thanos's actions and restore balance to the universe.",
    cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo', 'Chris Hemsworth', 'Scarlett Johansson'],
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    language: 'English',
    price: 95,
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
  },
  {
    title: 'Saltburn',
    genre: ['Thriller', 'Drama', 'Mystery'],
    rating: 7.1,
    releaseDate: '2023-11-17',
    duration: 131,
    description: 'Struggling to find his place at Oxford University, Oliver Quick finds himself drawn into the world of the charming and aristocratic Felix Catton, who invites him to Saltburn for a summer never to be forgotten.',
    cast: ['Barry Keoghan', 'Jacob Elordi', 'Rosamund Pike', 'Richard E. Grant', 'Alison Oliver'],
    poster: 'https://image.tmdb.org/t/p/w500/3LFBWSGWXrXVLO40fXfQ2ZXKLEp.jpg',
    backdrop: 'https://image.tmdb.org/t/p/original/aIkG0jDgCBwdBLMURCvroMpPIVL.jpg',
    language: 'English',
    price: 80,
    trailerUrl: 'https://www.youtube.com/watch?v=VMMiVne3kAI',
  },
]

const TIMES = ['10:00 AM', '1:30 PM', '4:00 PM', '7:30 PM', '10:00 PM']

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getDates(): string[] {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(formatDate(d))
  }
  return dates
}

async function main() {
  console.log('Seeding database…')

  await prisma.loyaltyTransaction.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bookingSeat.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.seat.deleteMany()
  await prisma.showtime.deleteMany()
  await prisma.oTPCode.deleteMany()
  await prisma.movie.deleteMany()

  const dates = getDates()

  for (const movieData of MOVIES) {
    const movie = await prisma.movie.create({ data: movieData })
    console.log(`  Created movie: ${movie.title}`)

    for (const date of dates) {
      for (let i = 0; i < TIMES.length; i++) {
        const time = TIMES[i]
        const format = i === 3 ? 'IMAX' : i === 4 ? '4DX' : 'Standard'
        const price = movieData.price + (i === 3 ? 20 : i === 4 ? 15 : 0)

        await prisma.showtime.create({
          data: { movieId: movie.id, date, time, format, price, availableSeats: 120 },
        })
      }
    }
  }

  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
