import { Component } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';

export interface User {
  id: number;
  name: string;
  email: string;
}

const USERS: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com' },
];

@Component({
  selector: 'app-cdk-table',
  standalone: true, // <-- Add this line
  imports: [CdkTableModule],
  templateUrl: './cdk-table.html',
  styleUrls: ['./cdk-table.scss'], // <-- Fix property name
})
export class CdkTable {
  displayedColumns: string[] = ['id', 'name', 'email'];
  dataSource = USERS;
}
