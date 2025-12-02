document.addEventListener('DOMContentLoaded', () => {
    // Voltar ao cardápio principal
    document.getElementById('btnVoltar')?.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Renderizar usuário logado (mesmo cookie usado no main.js)
    const usuarioStr = getCookie('usuario');
    const container = document.getElementById('usuarioLogadoContainer');
    if (!container) return;

    if (usuarioStr) {
        try {
            const usuario = JSON.parse(usuarioStr);
            renderUsuarioLogado(container, usuario);
        } catch (e) {
            console.warn('Erro ao parse do cookie usuario:', e);
            renderEntrar(container);
        }
    } else {
        renderEntrar(container);
    }
    document.querySelectorAll('input[name="crud"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const val = e.target.value;

            if (val === "funcionario") {
                window.location.href = "./funcionario/funcionario.html";
            }

            if (val === "pessoa") {
                window.location.href = "./pessoa/pessoa.html";
            }

            if (val === "produto") {
                window.location.href = "./produto/produto.html";
            }

            if (val === "categoria") {
                window.location.href = "./categoria/categoria.html";
            }

            if (val === "cargo") {
                window.location.href = "./cargo/cargo.html";
            }
        });
    });
});

function renderEntrar(container) {
    container.innerHTML = '<button onclick="window.location.href=\\\'../a-login/login.html\\\'">Entrar</button>';
}

function renderUsuarioLogado(container, usuario) {
    container.innerHTML = `
            <div class="usuario-dropdown" style="position: relative; display: flex; align-items: center;">
              <div class="usuario-avatar" id="usuarioAvatar" title="Clique para mais opções" style="cursor: pointer;background-color: #007bff;margin: 0em 1.5em 0em;width: 3em; border-radius:50%;border:2px solid #000; height: 3em; display:flex;align-items:center;justify-content:center;">
                <img src="../../assets/user.svg" alt="Usuário" style="width:2em;height:2em;">
              </div>
              <div class="usuario-menu" id="usuarioMenu" style="display:none; position:absolute; background:white; border:1px solid #ccc; border-radius:8px; padding:10px; margin-top:8.5em; right:1em; box-shadow:0 4px 8px rgba(0,0,0,0.1); min-width:160px; z-index:1000;">
                <div style="font-weight:600; margin-bottom:8px;">${escapeHtml(usuario.nome ?? 'Usuário')}</div>
                <div style="display:flex; gap:8px;">
                  <button id="btnSair" style="flex:1; padding:8px 10px; background:#e74c3c; color:white; border:none; border-radius:5px; cursor:pointer;">Sair</button>
                  ${usuario.tipo === 'adm' ? '<button id="btnAdmin" style="flex:1; padding:8px 10px; background:#3498db; color:white; border:none; border-radius:5px; cursor:pointer;">Admin</button>' : ''}
                </div>
              </div>
            </div>
        `;

    const avatar = document.getElementById('usuarioAvatar');
    const menu = document.getElementById('usuarioMenu');
    avatar?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (ev) => {
        if (!avatar.contains(ev.target) && !menu.contains(ev.target)) menu.style.display = 'none';
    });

    document.getElementById('btnSair')?.addEventListener('click', () => logoutUsuario());
    document.getElementById('btnAdmin')?.addEventListener('click', () => {
        window.location.href = './menu.html'; // ajuste se necessário
    });
}

function logoutUsuario() {
    // remove cookie 'usuario' e redireciona
    document.cookie = 'usuario=; max-age=0; path=/';
    try { localStorage.removeItem('pedidoAtual'); } catch (e) { }
    window.location.href = '../index.html';
}

// Helpers
function getCookie(nome) {
    const valor = `; ${document.cookie}`;
    const partes = valor.split(`; ${nome}=`);
    if (partes.length === 2) return decodeURIComponent(partes.pop().split(';').shift());
    return null;
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
