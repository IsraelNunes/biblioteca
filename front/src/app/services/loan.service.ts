import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:3000/api/emprestimos';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  requestLoan(loanData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, loanData, { headers: this.getAuthHeaders() });
  }

  getUserLoans(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${userId}`, { headers: this.getAuthHeaders() });
  }

  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  updateLoanStatus(loanId: number, statusData: { status: string, data_devolucao_real?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${loanId}/status`, statusData, { headers: this.getAuthHeaders() });
  }

  cancelLoan(loanId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${loanId}`, { headers: this.getAuthHeaders() });
  }
}
