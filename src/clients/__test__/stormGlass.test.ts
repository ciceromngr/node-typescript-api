import { StormGlass } from '@src/clients/stormGlass'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json'
import stormGlassNormalizedResponse3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json'
import axios from 'axios'

jest.mock('axios')

describe('StormGlass client', () => {
  const mockeAxios = axios as jest.Mocked<typeof axios>

  it('should return a normalize forecast from the stormGlass service', async () => {
    let lat = -16.0
    let lng = 152.555

    mockeAxios.get.mockResolvedValue({ data: stormGlassWeather3HoursFixture })

    const stormGlass = new StormGlass(mockeAxios)
    const response = await stormGlass.fetchPoints(lat, lng)
    expect(response).toEqual(stormGlassNormalizedResponse3Hours)
  })

  it('should exclude incomplete data points', async () => {
    const lat = -33.792726
    const lng = 151.289824
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    }

    mockeAxios.get.mockResolvedValue({ data: incompleteResponse })

    const stormGlass = new StormGlass(mockeAxios)
    const response = await stormGlass.fetchPoints(lat, lng)

    expect(response).toEqual([])
  })

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726
    const lng = 151.289824

    mockeAxios.get.mockRejectedValue({ message: 'Network Error' })

    const stormGlass = new StormGlass(mockeAxios)

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    )
  })

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    class FakeAxiosError extends Error {
      constructor(public response: object) {
        super();
      }
    }

    mockeAxios.get.mockRejectedValue(
      new FakeAxiosError({
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      })
    );

    const stormGlass = new StormGlass(mockeAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
})
