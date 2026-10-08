import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { Track } from '../../shared/models/track.model';
import { TrackService } from '../../shared/services/track.service';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-wav', 'audio/x-m4a', 'audio/mp4'];

@Component({
  imports: [ReactiveFormsModule, DatePipe, FileSizePipe],
  templateUrl: './tracks-page.html',
  styleUrl: './tracks-page.css',
})
export class TracksPageComponent implements OnDestroy {
  private readonly service = inject(TrackService);

  readonly tracks = signal<Track[]>([]);
  readonly page = signal(1);
  readonly pages = signal(1);
  
  readonly loading = signal(false);
  readonly isUploading = signal(false);
  
  readonly error = signal('');
  readonly uploadError = signal('');
  readonly uploadSuccess = signal('');
  
  // Nouveaux signaux pour la lecture
  readonly audioUrl = signal('');
  readonly playingTrackId = signal<string | null>(null);
  readonly playbackError = signal('');
  
  readonly title = new FormControl('', { nonNullable: true });
  file?: File;

  private successTimeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
  }

  choose(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.[0];

    this.uploadError.set('');
    this.uploadSuccess.set('');

    if (!selectedFile) {
      this.file = undefined;
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      this.uploadError.set('Le fichier est trop volumineux (maximum 25 Mo).');
      this.file = undefined;
      input.value = '';
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      this.uploadError.set('Format audio non supporté.');
      this.file = undefined;
      input.value = '';
      return;
    }

    this.file = selectedFile;
    console.debug('[TracksPage] Fichier sélectionné valide', this.file.name);
  }

  upload(): void {
    if (!this.file || this.isUploading()) return;

    if (this.file.size > MAX_FILE_SIZE || !ALLOWED_MIME_TYPES.includes(this.file.type)) {
      this.uploadError.set('Fichier invalide détecté avant l\'envoi.');
      return;
    }

    this.isUploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set('');
    
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }

    this.service.upload(this.file, this.title.value || this.file.name).subscribe({
      next: (track) => {
        console.debug('[TracksPage] Piste envoyée', track.id);
        
        this.isUploading.set(false);
        this.uploadSuccess.set('Piste importée avec succès !');
        
        this.successTimeoutId = setTimeout(() => {
          this.uploadSuccess.set('');
        }, 3500);

        this.title.setValue('');
        this.file = undefined;
        this.page.set(1);
        
        // C'est ici que this.load() est appelé après l'upload
        this.load();
      },
      error: (err: { error?: { message?: string } }) => {
        console.error('[TracksPage] Envoi impossible', err);
        this.isUploading.set(false);
        this.uploadError.set(err.error?.message ?? 'Erreur lors de l\'envoi.');
      },
    });
  }

  load(requestedPage: number = this.page()): void {
    const previousPage = this.page(); 
    this.page.set(requestedPage); 

    this.error.set('');
    this.loading.set(true);
    
    this.service.list(requestedPage).subscribe({
      next: (response) => {
        console.debug('[TracksPage] Pistes chargées', response.items.length);
        this.tracks.set(response.items);
        this.pages.set(response.pages);
        this.loading.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        console.error('[TracksPage] Chargement impossible', err);
        this.error.set(err.error?.message ?? 'Impossible de charger la bibliothèque.');
        this.page.set(previousPage); 
        this.loading.set(false);
      },
    });
  }

  go(page: number): void {
    this.load(page);
  }

  play(track: Track): void {
    // On réinitialise l'erreur et on marque la piste comme "en cours" (ou "en chargement")
    this.playbackError.set('');
    this.playingTrackId.set(track.id);

    this.service.audio(track.id).subscribe({
      next: (blob) => {
        console.debug('[TracksPage] Audio chargé', track.id);
        this.cleanupAudioUrl(); // Utilisation de la méthode factorisée
        this.audioUrl.set(URL.createObjectURL(blob));
      },
      error: (err) => {
        console.error('[TracksPage] Lecture HTTP impossible', err);
        // Échec réseau/droits : on annule l'état "en cours" et on affiche l'erreur
        this.playingTrackId.set(null);
        this.playbackError.set(err.error?.message ?? 'Impossible de charger l\'audio (accès refusé ou introuvable).');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.successTimeoutId) {
      clearTimeout(this.successTimeoutId);
    }
    this.cleanupAudioUrl();
  }

  formatMimeType(mime: string | undefined): string {
    if (!mime) return 'Inconnu';
    if (mime === 'audio/mpeg') return 'MP3';
    return mime.replace('audio/', '').replace('x-', '').toUpperCase();
  }

  onAudioError(event: Event): void {
    console.error('[TracksPage] Erreur de décodage audio natif', event);
    this.playbackError.set('Le navigateur ne parvient pas à lire ce fichier (format non supporté ou fichier corrompu).');
    this.playingTrackId.set(null);
    this.cleanupAudioUrl();
  }

  private cleanupAudioUrl(): void {
    const currentUrl = this.audioUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      this.audioUrl.set('');
    }
  }
}