import { InternalError } from '@src/util/errors/internal-error'
import { AxiosStatic } from 'axios'
import config, { IConfig } from 'config'

export interface StormGlassSource {
  [key: string]: number
}

export interface StormGlassPoint {
  readonly time: string
  readonly swellDirection: StormGlassSource
  readonly swellHeight: StormGlassSource
  readonly swellPeriod: StormGlassSource
  readonly waveDirection: StormGlassSource
  readonly waveHeight: StormGlassSource
  readonly windDirection: StormGlassSource
  readonly windSpeed: StormGlassSource
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[]
}

export interface ForecastPoitn {
  time: string
  swellDirection: number
  swellHeight: number
  swellPeriod: number
  waveDirection: number
  waveHeight: number
  windDirection: number
  windSpeed: number
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage = `Unexpected error when trying to communicate to StormGlass`
    super(`${internalMessage}: ${message}`, 500, 'Error')
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`, 429, '');
  }
}

const stormGlassResourceConfig: IConfig = config.get('App.resources.StormGlass')

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed'
  readonly stormGlassAPISource = 'noaa'

  constructor(protected request: AxiosStatic) {}
  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoitn[]> {
    try {
        const response = await this.request.get<StormGlassForecastResponse>(
          `${stormGlassResourceConfig.get('apiUrl')}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`,
          {
            headers: {
              Authorization: stormGlassResourceConfig.get('apiToken'),
            },
          }
        )
        return this.normalizedResponse(response.data)    
    } catch (err: any) {
      if(err.response && err.response.status) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)} Code: ${
            err.response.status
          }`
        );
      }
       throw new ClientRequestError('Network Error')
    }
  }

  private normalizedResponse(
    points: StormGlassForecastResponse
  ): ForecastPoitn[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }))
  }

  private isValidPoint(point: Partial<StormGlassPoint>): Boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    )
  }
}
