import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  mailAlreadyInUse: boolean = false;

  constructor(private router: Router,
              private httpClient: HttpClient,
              private formBuilder: FormBuilder,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      mail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+[.][a-z]{2,}$')]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  get f() { return this.registrationForm.controls; }

  onSubmit(mail, username, password) {
    this.httpClient.post<any>(`${environment.apiUrl}/create_user`, { mail, username, password })
      .subscribe(
        (res) => {
          this.authService.login(mail, password)
            .subscribe((data) => {
              this.router.navigate(['/']);
            });
        },
        (err) => {
          this.mailAlreadyInUse = true;
        });
  }

}
