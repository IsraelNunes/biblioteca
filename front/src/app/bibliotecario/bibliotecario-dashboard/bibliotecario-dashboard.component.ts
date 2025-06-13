import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { BookService } from '../../services/book.service';
import { LoanService } from '../../services/loan.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bibliotecario-dashboard',
  templateUrl: './bibliotecario-dashboard.component.html',
  styleUrls: ['./bibliotecario-dashboard.component.scss']
})
export class BibliotecarioDashboardComponent implements OnInit {
  books: any[] = [];
  bookForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isEditing: boolean = false;
  currentBookId: number | null = null;

  allLoans: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookService: BookService,
    private loanService: LoanService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log('BibliotecarioDashboardComponent carregado.');
    this.loadBooks();
    this.initBookForm();
    this.loadAllLoans();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books = data;
        console.log('Livros carregados:', this.books);
      },
      error: (error) => {
        console.error('Erro ao carregar livros:', error);
        this.errorMessage = 'Erro ao carregar livros. Tente novamente.';
      }
    });
  }

  initBookForm(): void {
    this.bookForm = this.fb.group({
      id: [null],
      titulo: ['', Validators.required],
      autor: ['', Validators.required],
      ano_publicacao: ['', [Validators.min(1000), Validators.max(new Date().getFullYear())]],
      quantidade_disponivel: ['', [Validators.required, Validators.min(0)]]
    });
  }

  submitBookForm(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.bookForm.valid) {
      const bookData = this.bookForm.value;

      if (this.isEditing && this.currentBookId) {
        this.bookService.updateBook(this.currentBookId, bookData).subscribe({
          next: (response) => {
            this.successMessage = 'Livro atualizado com sucesso!';
            this.resetBookForm();
            this.loadBooks();
          },
          error: (error) => {
            console.error('Erro ao atualizar livro:', error);
            this.errorMessage = error.error?.message || 'Falha ao atualizar livro.';
          }
        });
      } else {
        this.bookService.addBook(bookData).subscribe({
          next: (response) => {
            this.successMessage = 'Livro adicionado com sucesso!';
            this.resetBookForm();
            this.loadBooks();
          },
          error: (error) => {
            console.error('Erro ao adicionar livro:', error);
            this.errorMessage = error.error?.message || 'Falha ao adicionar livro.';
          }
        });
      }
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }

  editBook(book: any): void {
    this.isEditing = true;
    this.currentBookId = book.id;
    this.bookForm.patchValue(book);
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteBook(id: number): void {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
      this.bookService.deleteBook(id).subscribe({
        next: (response) => {
          this.successMessage = 'Livro excluído com sucesso!';
          this.loadBooks();
          if (this.currentBookId === id) {
            this.resetBookForm();
          }
        },
        error: (error) => {
          console.error('Erro ao excluir livro:', error);
          this.errorMessage = error.error?.message || 'Falha ao excluir livro.';
        }
      });
    }
  }

  resetBookForm(): void {
    this.bookForm.reset();
    this.isEditing = false;
    this.currentBookId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadAllLoans(): void {
    this.loanService.getAllLoans().subscribe({
      next: (data) => {
        this.allLoans = data;
        console.log('Todos os empréstimos carregados:', this.allLoans);
      },
      error: (error) => {
        console.error('Erro ao carregar todos os empréstimos:', error);
        this.errorMessage = 'Erro ao carregar empréstimos. Tente novamente.';
      }
    });
  }

  updateLoanStatus(loan: any, newStatus: string): void {
    this.errorMessage = '';
    this.successMessage = '';
    const statusData: { status: string; data_devolucao_real?: string } = { status: newStatus };

    if (newStatus === 'devolvido') {
      statusData.data_devolucao_real = new Date().toISOString().slice(0, 10);
    }

    if (confirm(`Tem certeza que deseja mudar o status do empréstimo de "${loan.titulo_livro}" para "${newStatus}"?`)) {
      this.loanService.updateLoanStatus(loan.id, statusData).subscribe({
        next: (response) => {
          this.successMessage = `Status do empréstimo de "${loan.titulo_livro}" atualizado para "${newStatus}"!`;
          console.log('Empréstimo atualizado:', response);
          this.loadAllLoans();
          this.loadBooks();
        },
        error: (error) => {
          console.error('Erro ao atualizar status do empréstimo:', error);
          this.errorMessage = error.error?.message || 'Falha ao atualizar status do empréstimo.';
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}