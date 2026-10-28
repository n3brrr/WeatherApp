function retryButton(onRetry: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'status__retry';
  button.textContent = 'REINTENTAR';
  button.addEventListener('click', onRetry);
  return button;
}

export function renderLoading(container: HTMLElement): void {
  const loading = document.createElement('p');
  loading.className = 'status__loading';
  loading.textContent = 'CARGANDO';
  container.replaceChildren(loading);
}

export function renderError(
  container: HTMLElement,
  message: string,
  onRetry: () => void,
): void {
  const error = document.createElement('div');
  error.className = 'status__error';
  error.setAttribute('role', 'alert');

  const text = document.createElement('p');
  text.className = 'status__message';
  text.textContent = message;

  error.append(text, retryButton(onRetry));
  container.replaceChildren(error);
}

export function renderNotice(
  container: HTMLElement,
  message: string,
  options: { retry?: () => void } = {},
): void {
  const notice = document.createElement('div');
  notice.className = 'status__notice';

  const text = document.createElement('p');
  text.className = 'status__message';
  text.textContent = message;

  notice.append(text);

  if (options.retry) {
    notice.append(retryButton(options.retry));
  }

  container.replaceChildren(notice);
}

export function clearStatus(container: HTMLElement): void {
  container.replaceChildren();
}
