import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MikroTikService {
  private createAuthHeader(auth: { username: string; password: string }) {
    return `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
  }

  async fetchDeviceName(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    try {
      const authHeader = this.createAuthHeader(auth);
      const response = await axios.get(`${routerUrl}/rest/system/identity`, {
        headers: { Authorization: authHeader },
      });
      return response.data.name || null; 
    } catch (error) {
      console.error('Error fetching device name from system/identity:', error);
      throw new HttpException(
        `Failed to fetch device name: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Method to fetch all data from specified endpoints
  async fetchAllData(routerUrl: string, auth: { username: string; password: string }) {
    const endpoints = [
      'system/resource',
      'system/identity',
      'system/clock',
      'interface',
      'tool/netwatch',
      'ip/address',
      'ip/arp',
    ];

    try {
      const authHeader = this.createAuthHeader(auth);
      const requests = endpoints.map(endpoint =>
        axios.get(`${routerUrl}/rest/${endpoint}`, { headers: { Authorization: authHeader } })
      );

      const responses = await Promise.all(requests);
      const mergedData = Object.fromEntries(responses.map((response, index) => [endpoints[index], response.data]));

      return mergedData;
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw new HttpException(
        `Failed to fetch data from endpoints: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Method to fetch data from a specific endpoint
  async fetchEndpointData(routerUrl: string, auth: { username: string; password: string }, endpoint: string) {
    try {
      const authHeader = this.createAuthHeader(auth);
      const response = await axios.get(`${routerUrl}/rest/${endpoint}`, {
        headers: { Authorization: authHeader },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw new HttpException(
        `Failed to fetch data from ${endpoint}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Method to fetch netwatch data
  async fetchNetwatchData(routerUrl: string, auth: { username: string; password: string }): Promise<any[]> {
    try {
      const netwatchResponse = await axios.get(`${routerUrl}/rest/tool/netwatch`, {
        headers: {
          Authorization: this.createAuthHeader(auth),
        },
      });
      return netwatchResponse.data;
    } catch (error) {
      console.error('Error fetching netwatch data:', error);
      throw new HttpException(
        `Failed to fetch netwatch data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Helper method to fetch WAN IP address by comment
  async fetchWanIpAddressByComment(routerUrl: string, auth: { username: string; password: string }, comment: string): Promise<string | null> {
    try {
      const interfaceResponse = await axios.get(`${routerUrl}/rest/interface?comment=${comment}`, {
        headers: { Authorization: this.createAuthHeader(auth) },
      });

      const interfaces = interfaceResponse.data;
      if (interfaces.length === 0) {
        console.log(`Interface with comment '${comment}' not found.`);
        return null;
      }

      const wanInterfaceName = interfaces[0].name;
      const ipResponse = await axios.get(`${routerUrl}/rest/ip/address?interface=${wanInterfaceName}`, {
        headers: { Authorization: this.createAuthHeader(auth) },
      });

      const ipAddresses = ipResponse.data;
      return ipAddresses[0]?.address || null;
    } catch (error) {
      console.error(`Error fetching ${comment} IP address:`, error);
      return null;
    }
  }

  // Method to fetch WAN1 IP address
  async fetchWan1IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN1');
  }

  // Method to fetch WAN2 IP address
  async fetchWan2IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN2');
  }
}
