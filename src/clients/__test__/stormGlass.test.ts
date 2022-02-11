import { StormGlass } from '@src/clients/stormGlass'

describe('StormGlass client', () => {
    it('should return a normalize forecast from the stormGlass service', async () => {
        let lat = -16.000
        let lng = 152.555

        const stormGlass = new StormGlass()
        const response = await stormGlass.fetchPoints(lat, lng)
        expect(response).toEqual({})
    })
})