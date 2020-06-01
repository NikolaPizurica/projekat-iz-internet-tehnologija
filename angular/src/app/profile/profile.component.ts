import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User;
  avatarSrc = '';
  fileToUpload: File;

  constructor(private router: Router,
              private httpClient: HttpClient,
              private formBuilder: FormBuilder,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.avatarSrc = `${environment.apiUrl}/get_avatar?id=${this.user.id}&${Date.now()}`;
  }

  onAvatarError(e) {
    e.currentTarget.src = `${environment.defaultAvi}`;
  }

  deleteAvatar() {
    this.httpClient.delete(`${environment.apiUrl}/remove_user_avatar`)
      .subscribe((data) => {
        // this.router.navigate(['/profile']);
        location.reload();
      });
  }

  changeAvatar(e) {
    let fileList: FileList = e.target.files;
    if(fileList.length > 0) {
      this.fileToUpload = fileList[0];
      const formData = new FormData();
      formData.append('file', this.fileToUpload, this.fileToUpload.name);
      this.httpClient.post(`${environment.apiUrl}/set_user_avatar`, formData)
        .subscribe((res) => {
          location.reload();
        });
    }
  }

}
