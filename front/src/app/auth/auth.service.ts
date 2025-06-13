import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token && response.perfil) {
          this.setToken(response.token);
          this.setPerfil(response.perfil);
          if (response.userId) {
            localStorage.setItem('userId', response.userId.toString());
          }
          console.log('Login bem-sucedido. Token, perfil e userId armazenados.');
        }
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setPerfil(perfil: string) {
    localStorage.setItem('userPerfil', perfil);
  }

  getPerfil(): string | null {
    return localStorage.getItem('userPerfil');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPerfil');
    localStorage.removeItem('userId');
  }
}