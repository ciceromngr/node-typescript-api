import { StormGlass } from '@src/clients/stormGlass'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json'
import stormGlassNormalizedResponse3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json'
import axios from 'axios'

jest.mock('axios')

describe('StormGlass client', () => {
    
    const mockeAxios = axios as jest.Mocked<typeof axios>
    
    it('should return a normalize forecast from the stormGlass service', async () => {
        let lat = -16.000
        let lng = 152.555

        mockeAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture })

        const stormGlass = new StormGlass(mockeAxios)
        const response = await stormGlass.fetchPoints(lat, lng)
        expect(response).toEqual(stormGlassNormalizedResponse3Hours)
    })
})