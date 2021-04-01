const timeout = 20000
import path from 'path'
import fs from 'fs'
import os from 'os'
import { main } from '../src/tools.js'
const TEMPORARY_DIRECTORY = os.tmpdir()
const HEADERS = "bookingTime,duration,slotTime,pool,"

const dumbConfirmSlot = async (debugPath, chosenSlot) => {
  return chosenSlot
}
// Test must run in band
describe("No booked slots", () => {
  let startTestSet
  beforeAll((done) => {
    startTestSet = new Date()
    done()
  });

  afterAll((done) => {
    const seconds = Math.round((new Date() - startTestSet) / 1000);
    console.log("Test Set run in " + seconds + " seconds ")
    done()
  });


  it('available slots = 0, booked slots = 0', async (done) => {
    const startTest = new Date()
    const pool = 'bellevue'
    const slotsDir = TEMPORARY_DIRECTORY + "/" + startTest.getTime()
    fs.mkdirSync(slotsDir, { recursive: true });
    const slotsPath = slotsDir + "/" + "slots.csv"
    console.log(slotsPath)
    fs.writeFileSync(slotsPath, HEADERS)
    const result = await main(
      pool,
      slotsPath,
      'file:///' + path.resolve('./__tests__/resources/no-available-slots.html'),
      dumbConfirmSlot
    )
    console.log("RESULT : " + JSON.stringify(result))
    expect(result.freeSlots).toEqual([])
    expect(result.bookedSlots).toEqual([])
    expect(result.chosenSlot).toBeUndefined();
    expect(result.confirmedSlot).toBeUndefined();
    expect(result.storedSlot).toBeUndefined();
    const duration = Math.round((new Date() - startTest) / 1000);
    console.log(duration + " seconds")
    done()
  }, timeout)

  it('available slots = 1 [mercredi 31 mars 2021@16:00], booked slots = 0', async (done) => {
    const startTest = new Date()
    const pool = 'bellevue'
    const slotsDir = TEMPORARY_DIRECTORY + "/" + startTest.getTime()
    fs.mkdirSync(slotsDir, { recursive: true });
    const slotsPath = slotsDir + "/" + "slots.csv"
    console.log(slotsPath)
    fs.writeFileSync(slotsPath, HEADERS)
    const result = await main(
      pool,
      slotsPath,
      'file:///' + path.resolve('./__tests__/resources/one-available-slot.html'),
      dumbConfirmSlot
    )
    console.log("RESULT : " + JSON.stringify(result))
    expect(result.freeSlots.length).toEqual(1)
    expect(result.freeSlots[0].slotTime).toEqual("mercredi31 mars 2021@16:00")
    expect(result.freeSlots[0].pool).toEqual(pool)
    expect(result.bookedSlots).toEqual([])
    expect(result.chosenSlot.slotTime).toEqual("mercredi31 mars 2021@16:00")
    expect(result.chosenSlot.pool).toEqual(pool)
    expect(result.confirmedSlot.slotTime).toEqual("mercredi31 mars 2021@16:00")
    expect(result.confirmedSlot.pool).toEqual(pool)
    expect(result.storedSlot.slotTime).toEqual("mercredi31 mars 2021@16:00")
    expect(result.storedSlot.pool).toEqual(pool)
    const duration = Math.round((new Date() - startTest) / 1000);
    console.log(duration + " seconds")
    done()
  }, timeout)

  it('available slots = 4 [jeudi1 avril 2021@16:00, vendredi2 avril 2021@16:00, samedi3 avril 2021@15:45, dimanche4 avril 2021@15:45], booked slots = 0', async (done) => {
    const startTest = new Date()
    const pool = 'bellevue'
    const slotsDir = TEMPORARY_DIRECTORY + "/" + startTest.getTime()
    fs.mkdirSync(slotsDir, { recursive: true });
    const slotsPath = slotsDir + "/" + "slots.csv"
    console.log(slotsPath)
    fs.writeFileSync(slotsPath, HEADERS)
    const result = await main(
      pool,
      slotsPath,
      'file:///' + path.resolve('./__tests__/resources/many-available-slots.html'),
      dumbConfirmSlot
    )
    console.log("RESULT : " + JSON.stringify(result))
    let i = 0
    expect(result.freeSlots.length).toEqual(4)
    expect(result.freeSlots[i].slotTime).toEqual("jeudi1 avril 2021@16:00")
    expect(result.freeSlots[i].pool).toEqual(pool)
    i++
    expect(result.freeSlots[i].slotTime).toEqual("vendredi2 avril 2021@16:00")
    expect(result.freeSlots[i].pool).toEqual(pool)
    i++
    expect(result.freeSlots[i].slotTime).toEqual("samedi3 avril 2021@15:45")
    expect(result.freeSlots[i].pool).toEqual(pool)
    i++
    expect(result.freeSlots[i].slotTime).toEqual("dimanche4 avril 2021@15:45")
    expect(result.freeSlots[i].pool).toEqual(pool)
    expect(result.bookedSlots).toEqual([])
    expect(result.chosenSlot.slotTime).toEqual("jeudi1 avril 2021@16:00")
    expect(result.chosenSlot.pool).toEqual(pool)
    expect(result.confirmedSlot.slotTime).toEqual("jeudi1 avril 2021@16:00")
    expect(result.confirmedSlot.pool).toEqual(pool)
    expect(result.storedSlot.slotTime).toEqual("jeudi1 avril 2021@16:00")
    expect(result.storedSlot.pool).toEqual(pool)
    const duration = Math.round((new Date() - startTest) / 1000);
    console.log(duration + " seconds")
    done()
  }, timeout)

}, timeout)
