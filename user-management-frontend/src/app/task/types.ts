import { ReactNode } from "react";

// Define the Customer interface
export interface Customer {
    name: string | number | readonly string[] | undefined;
    id: number;
    customerName: string;
  }

// Define the Site interface
export interface Site {
    name: string | number | readonly string[] | undefined;
    id: number;
    siteName: string;
  }

// Define the Service interface
export interface Service {
    name: string | number | readonly string[] | undefined;
    id: number;
    serviceName: string;
  }


  export enum ServiceType {
    AMC = 'AMC',
    OnDemandSupport = 'OnDemandSupport',
    NewInstallation = 'NewInstallation'
}


// Define the Task interface
export interface Task {
    customer: Customer;
    site: Site;
    service: Service;
    id: number;
    customerId: number;
    customerName: string;
    siteId: number;
    siteName: string;
    serviceId: number;
    serviceName: string;
    description: string;
    date: string; // Consider using Date for better date handling
    remark: string;
    serviceType: ServiceType; // Use enum if applicable
}


export interface EditTaskModalProps {
    task: Task;
    isOpen: boolean;
    closeModal: () => void;
    onTaskUpdated: (updatedTask: Task) => void;
    customers?: Customer[];
    sites?: Site[];
    services?: Service[];
  }
  
  export interface CreateTaskModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onTaskCreated: () => void;
    customers: Customer[];
    sites: Site[];
    services: Service[];
  }
  