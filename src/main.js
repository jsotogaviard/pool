import {main} from './tools.js'

/**
 * Run main function
*/ 
const poolName = process.argv[2]
const BOOKED_SLOTS_PATH = "slots/slots.csv"
const FREE_SLOTS_URL = "https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/"
await main(
    poolName,
    BOOKED_SLOTS_PATH,
    FREE_SLOTS_URL
)
