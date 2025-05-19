class ChatBot {
  constructor(options) {
    this.apiCall = options.apiCall;
    this.user = options.user || { name: "Usuario", photo: "https://res.cloudinary.com/dienilw2p/image/upload/v1747635921/hubdox/lgvqg0648leq6meeusid.png" };
    this.bot = options.bot || { name: "Bot", img: "https://res.cloudinary.com/dienilw2p/image/upload/v1747635921/hubdox/xevgjbvb1ri3ytpletzk.png" };
    this.chatUuid = options.chatUuid || this._generateUUID();

    this.messages = [];
    this.loading = false;

    this._loadBootstrapCSS().then(() => {
      this._renderFloatingButton();
      this._renderModal();
      this._addInitialMessage();
    });
  }

  _loadBootstrapCSS() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('link[data-bootstrap="injected"]')) {
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
      link.dataset.bootstrap = 'injected';
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Error cargando Bootstrap CSS'));
      document.head.appendChild(link);
    });
  }

  _generateUUID() {
    return 'xxxxxx'.replace(/[x]/g, () => ((Math.random() * 16) | 0).toString(16));
  }

  _getCurrentTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  _renderFloatingButton() {
    this.floatingBtn = document.createElement('button');
    this.floatingBtn.type = 'button';
    this.floatingBtn.title = 'Abrir chat';
    this.floatingBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="24" height="24" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>`;
    this.floatingBtn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #0d6efd;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgb(13 110 253 / 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    `;
    document.body.appendChild(this.floatingBtn);

    this.floatingBtn.addEventListener('click', () => {
      this._showModal();
    });
  }

  _renderModal() {
    // Crear backdrop + modal container
    this.backdrop = document.createElement('div');
    this.backdrop.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 1050;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    this.modal = document.createElement('div');
    this.modal.className = 'card shadow';
    this.modal.style.cssText = `
      width: 400px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    this.modal.innerHTML = `
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Chat IA</h5>
        <button type="button" class="btn-close btn-close-white" aria-label="Cerrar"></button>
      </div>
      <div class="card-body overflow-auto" style="flex-grow: 1; height: 350px;" id="chat-messages"></div>
      <div class="card-footer bg-white">
        <form id="chat-form" class="d-flex gap-2" autocomplete="off" novalidate>
          <input
            id="chat-input"
            type="text"
            class="form-control rounded-pill"
            placeholder="Escribe un mensaje..."
            aria-label="Mensaje"
            required
          />
          <button
            id="chat-send"
            type="submit"
            class="btn btn-primary rounded-pill px-4"
            disabled
          >
            Enviar
          </button>
        </form>
      </div>
    `;

    this.backdrop.appendChild(this.modal);
    document.body.appendChild(this.backdrop);

    this.messagesContainer = this.modal.querySelector('#chat-messages');
    this.form = this.modal.querySelector('#chat-form');
    this.input = this.modal.querySelector('#chat-input');
    this.sendButton = this.modal.querySelector('#chat-send');
    this.closeBtn = this.modal.querySelector('.btn-close');

    this.form.addEventListener('submit', e => {
      e.preventDefault();
      this._sendMessage();
    });

    this.input.addEventListener('input', () => {
      this.sendButton.disabled = this.input.value.trim() === '' || this.loading;
    });

    this.closeBtn.addEventListener('click', () => this._hideModal());

    this.backdrop.addEventListener('click', e => {
      if (e.target === this.backdrop) this._hideModal();
    });
  }

  _showModal() {
    this.backdrop.style.display = 'flex';
    this.input.focus();
  }

  _hideModal() {
    this.backdrop.style.display = 'none';
  }

  _addInitialMessage() {
    this._addMessage(
      'bot',
      `Hola ${this.user.name}, soy un bot y solo responderé información relacionada al documento. ¿En qué puedo ayudarte?`
    );
  }

  _addMessage(from, text) {
    const time = this._getCurrentTime();
    this.messages.push({ from, text, time });
    this._renderMessages();
  }

  _renderMessages() {
    const frag = document.createDocumentFragment();
    this.messagesContainer.innerHTML = '';

    this.messages.forEach(msg => {
      const msgWrapper = document.createElement('div');
      msgWrapper.classList.add('d-flex', 'mb-3');
      msgWrapper.classList.add(msg.from === 'user' ? 'justify-content-end' : 'justify-content-start');

      const avatar = document.createElement('img');
      avatar.src = msg.from === 'user' ? this.user.photo : this.bot.img;
      avatar.alt = msg.from === 'user' ? this.user.name : this.bot.name;
      avatar.className = 'rounded-circle';
      avatar.style.width = '48px';
      avatar.style.height = '48px';
      avatar.style.objectFit = 'cover';

      const bubble = document.createElement('div');
      bubble.className = [
        'px-3',
        'py-2',
        'mx-2',
        'rounded-3',
        'position-relative',
        'w-auto',
      ].join(' ');

      bubble.style.maxWidth = '75%';
      if (msg.from === 'user') {
        bubble.classList.add('bg-primary', 'text-white');
      } else {
        bubble.classList.add('bg-light', 'text-dark');
      }

      const info = document.createElement('small');
      info.className = 'fw-bold d-block mb-1';
      info.innerHTML = `${msg.from === 'user' ? 'Tú' : 'Bot'} <span class="text-muted fs-7 ms-2" style="font-size:0.75rem;">${msg.time}</span>`;

      const textP = document.createElement('p');
      textP.className = 'mb-0';
      textP.style.whiteSpace = 'pre-wrap';
      textP.textContent = msg.text;

      bubble.appendChild(info);
      bubble.appendChild(textP);

      // Cola burbuja simple
      const tail = document.createElement('span');
      tail.style.position = 'absolute';
      tail.style.bottom = '0';
      tail.style.width = '0';
      tail.style.height = '0';
      tail.style.borderStyle = 'solid';

      if (msg.from === 'user') {
        tail.style.right = '0';
        tail.style.borderWidth = '0.6rem 0 0.6rem 0.6rem';
        tail.style.borderColor = 'transparent transparent transparent #0d6efd';
        tail.style.transform = 'translateX(50%)';
      } else {
        tail.style.left = '0';
        tail.style.borderWidth = '0.6rem 0.6rem 0.6rem 0';
        tail.style.borderColor = 'transparent #f8f9fa transparent transparent';
        tail.style.transform = 'translateX(-50%)';
      }

      bubble.appendChild(tail);

      msgWrapper.appendChild(avatar);
      msgWrapper.appendChild(bubble);
      frag.appendChild(msgWrapper);
    });

    if (this.loading) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'text-center text-muted fst-italic';
      loadingDiv.innerHTML = `
        <div class="spinner-border spinner-border-sm text-primary mb-1" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Bot está escribiendo...
      `;
      frag.appendChild(loadingDiv);
    }

    this.messagesContainer.appendChild(frag);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

    this.sendButton.disabled = this.input.value.trim() === '' || this.loading;
  }

  async _sendMessage() {
    const msg = this.input.value.trim();
    if (!msg || this.loading) return;

    this._addMessage('user', msg);
    this.input.value = '';
    this.sendButton.disabled = true;

    this.loading = true;
    this._renderMessages();

    try {
      const res = await fetch(this.apiCall, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, uuid: this.chatUuid }),
      });

      if (!res.ok) throw new Error('Error en respuesta');

      const data = await res.json();
      const answer = data.answer || 'No obtuve respuesta 😢.';
      this._addMessage('bot', answer);
    } catch (error) {
      this._addMessage('bot', 'Error al obtener respuesta. Intenta nuevamente.');
      console.error(error);
    } finally {
      this.loading = false;
      this._renderMessages();
      this.input.focus();
    }
  }
}
