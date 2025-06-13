import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { BookService } from '../../services/book.service';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-leitor-dashboard',
  templateUrl: './leitor-dashboard.component.html',
  styleUrls: ['./leitor-dashboard.component.scss']
})
export class LeitorDashboardComponent implements OnInit {
  availableBooks: any[] = [];
  myLoans: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  currentLeitorId: number | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookService: BookService,
    private loanService: LoanService
  ) { }

  ngOnInit(): void {
    console.log('LeitorDashboardComponent carregado.');
    const userId = this.authService.getUserId();
    if (userId) {
      this.currentLeitorId = parseInt(userId);
      this.loadAvailableBooks();
      this.loadMyLoans();
    } else {
      this.errorMessage = 'ID do usuário não encontrado. Por favor, faça login novamente.';
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  loadAvailableBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.availableBooks = data.filter(book => book.quantidade_disponivel > 0);
        console.log('Livros disponíveis carregados:', this.availableBooks);
      },
      error: (error) => {
        console.error('Erro ao carregar livros disponíveis:', error);
        this.errorMessage = 'Erro ao carregar livros disponíveis. Tente novamente.';
      }
    });
  }

  loadMyLoans(): void {
    if (this.currentLeitorId === null) {
      this.errorMessage = 'Erro: ID do leitor não disponível para carregar empréstimos.';
      return;
    }
    this.loanService.getUserLoans(this.currentLeitorId).subscribe({
      next: (data) => {
        this.myLoans = data;
        console.log('Meus empréstimos carregados:', this.myLoans);
      },
      error: (error) => {
        console.error('Erro ao carregar meus empréstimos:', error);
        this.errorMessage = error.error?.message || 'Erro ao carregar seus empréstimos. Tente novamente.';
      }
    });
  }

  requestBookLoan(book: any): void {
    this.errorMessage = '';
    this.successMessage = '';
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 15);
    const data_devolucao_prevista = returnDate.toISOString().slice(0, 10);

    const loanData = {
      livro_id: book.id,
      titulo_livro: book.titulo,
      data_devolucao_prevista: data_devolucao_prevista
    };

    if (confirm(`Deseja solicitar o empréstimo de "${book.titulo}"?`)) {
      this.loanService.requestLoan(loanData).subscribe({
        next: (response) => {
          this.successMessage = `Empréstimo de "${book.titulo}" solicitado com sucesso!`;
          console.log('Empréstimo solicitado:', response);
          this.loadAvailableBooks();
          this.loadMyLoans();
        },
        error: (error) => {
          console.error('Erro ao solicitar empréstimo:', error);
          this.errorMessage = error.error?.message || 'Falha ao solicitar empréstimo.';
        }
      });
    }
  }

  requestReturnBook(loan: any): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (confirm(`Deseja marcar como devolvido "${loan.titulo_livro}"? (Esta ação será confirmada pelo bibliotecário)`)) {
      this.successMessage = `Solicitação de devolução para "${loan.titulo_livro}" enviada para o bibliotecário.`;
      console.log('Solicitação de devolução enviada (apenas frontend):', loan);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}