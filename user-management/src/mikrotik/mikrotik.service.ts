// src/mikrotik/mikrotik.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MikroTikService {
  async fetchAllData(routerUrl: string, auth: { username: string; password: string }) {
    const endpoints = [
      'system/resource',
      'system/clock',
      'interface',
      'tool/netwatch',
      'ip/address',
      'ip/arp',
    ];

    try {
      const authHeader = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');

      // Create an array of promises for fetching each endpoint
      const requests = endpoints.map(endpoint =>
        axios.get(`${routerUrl}/rest/${endpoint}`, {
          headers: { Authorization: `Basic ${authHeader}` },
        })
      );

      // Execute all requests concurrently
      const responses = await Promise.all(requests);

      // Merge all responses into a single object
      const mergedData = {};
      responses.forEach((response, index) => {
        mergedData[endpoints[index]] = response.data;
      });

      return mergedData;

    } catch (error) {
      throw new HttpException(
        `Failed to fetch data from endpoints: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchEndpointData(routerUrl: string, auth: { username: string; password: string }, endpoint: string) {
    try {
      const authHeader = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      const response = await axios.get(`${routerUrl}/rest/${endpoint}`, {
        headers: { Authorization: `Basic ${authHeader}` },
      });
      return response.data;

    } catch (error) {
      throw new HttpException(
        `Failed to fetch data from ${endpoint}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async fetchNetwatchData(routerUrl: string, auth: { username: string; password: string }): Promise<any[]> {
    try {
      const netwatchResponse = await axios.get(`${routerUrl}/rest/tool/netwatch`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`,
        },
      });

      return netwatchResponse.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch netwatch data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Fetch WAN1 IP address
  async fetchWan1IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN1');
  }

  // Fetch WAN2 IP address
  async fetchWan2IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN2');
  }

  // Generalized method to fetch WAN IP addresses by interface comment
  private async fetchWanIpAddressByComment(routerUrl: string, auth: { username: string; password: string }, comment: string): Promise<string | null> {
    try {
      // Step 1: Fetch the interface with the specified comment
      const interfaceUrl = `${routerUrl}/rest/interface?comment=${comment}`;
      const interfaceResponse = await axios.get(interfaceUrl, {
        headers: { Authorization: `Basic ${auth.username}:${auth.password}` },
      });

      const interfaces = interfaceResponse.data;
      if (interfaces.length === 0) {
        console.log(`Interface with comment '${comment}' not found.`);
        return null;
      }

      const wanInterfaceName = interfaces[0].name;

      // Step 2: Fetch IP address associated with the interface name
      const ipAddressUrl = `${routerUrl}/rest/ip/address?interface=${wanInterfaceName}`;
      const ipResponse = await axios.get(ipAddressUrl, {
        headers: { Authorization: `Basic ${auth.username}:${auth.password}` },
      });

      const ipAddresses = ipResponse.data;
      const wanIp = ipAddresses[0]?.address;

      return wanIp || null;
    } catch (error) {
      console.error(`Error fetching ${comment} IP address:`, error);
      return null;
    }
  }
}
