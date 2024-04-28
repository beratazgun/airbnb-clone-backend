import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';

export interface IIpgeolocationResponse {
  asn: string;
  calling_code: string;
  city: string;
  connection_type: string;
  continent_code: string;
  continent_name: string;
  country_capital: string;
  country_code2: string;
  country_code3: string;
  country_flag: string;
  country_name: string;
  country_tld: string;
  currency: Currency;
  district: string;
  geoname_id: number;
  hostname: string;
  ip: string;
  is_eu: string;
  isp: string;
  languages: string;
  latitude: number;
  longitude: number;
  organization: string;
  state_prov: string;
  time_zone: TimeZone;
  zipcode: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface TimeZone {
  current_time: string;
  current_time_unix: string;
  dst_savings: number;
  is_dst: string;
  name: string;
  offset: number;
}

export async function getIp(req: Request) {
  const ip: string = req.clientIp.split(':').pop();

  try {
    const response: AxiosResponse<IIpgeolocationResponse> = await axios.get(
      `https://api.ipgeolocation.io/ipgeo?apiKey=1b2e4152139143f2883eec7f129bc433${process.env.NODE_ENV === 'development' ? '' : '&ip=' + ip}`,
    );

    const location = response.data;

    return location;
  } catch (error) {
    console.log(error);
  }
}
