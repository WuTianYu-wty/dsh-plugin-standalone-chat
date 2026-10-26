window.__ModuleLoader__.load({
  id: '@local/standalone-chat',
  factory() {
    const STYLES = `
      .dsh-scope-row {
        flex-wrap: wrap;
        gap: 6px;
      }
      .dsh-scope-row > .dsh-scope-button {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 0;
        max-width: min(260px, 100%);
        height: 30px;
        padding: 0 10px;
        border: 1px solid var(--dsw-alias-border-l4, #464646);
        border-radius: var(--dsw-radius-md, 8px);
        background: transparent;
        color: var(--dsw-alias-label-secondary, #b7b7b7);
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        line-height: 18px;
        cursor: pointer;
        transition: background-color 120ms ease, border-color 120ms ease;
      }
      .dsh-scope-button > svg { flex-shrink: 0; }
      .dsh-scope-button [class*="workspaceLabel"] {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dsh-scope-row > .dsh-no-project { flex-shrink: 0; }
      .dsh-scope-row > .dsh-scope-button:hover:not(:disabled),
      .dsh-scope-button[aria-expanded="true"] {
        background: var(--dsw-alias-interactive-bg-hover, #292929);
        color: var(--dsw-alias-label-primary, #eeeeee);
      }
      .dsh-scope-button[data-dsh-project-active="true"],
      .dsh-no-project[aria-pressed="true"] {
        background: var(--dsw-alias-interactive-bg-hover, #292929);
        color: var(--dsw-alias-label-primary, #eeeeee);
        border-color: var(--dsw-alias-label-tertiary, #777777);
      }
      .dsh-scope-row > .dsh-scope-button:focus-visible {
        outline: 2px solid var(--dsw-focus-ring-color, #7ca5ee);
        outline-offset: 2px;
      }
      .dsh-no-project:disabled { cursor: wait; opacity: .6; }
      .dsh-scope-button[data-dsh-scratchpad="true"] [class*="workspaceLabel"] {
        font-size: 0;
      }
      .dsh-scope-button[data-dsh-scratchpad="true"] [class*="workspaceLabel"]::after {
        content: '选择项目';
        font-size: 13px;
      }
      .dsh-scope-error {
        flex-basis: 100%;
        margin: 2px 0;
        color: var(--dsw-alias-state-error-primary, #e78484);
        font-size: 12px;
        line-height: 18px;
        overflow-wrap: anywhere;
      }
      @media (prefers-reduced-motion: reduce) {
        .dsh-scope-row > .dsh-scope-button { transition: none; }
      }
    `;

    return {
      inject: ['uiWorkspace', 'sessions', 'workspaces'],
      apply(ctx) {
        if (typeof document === 'undefined' || !document.body) return;
        const uiWorkspace = ctx.get('uiWorkspace');
        const sessions = ctx.get('sessions');
        const workspaces = ctx.get('workspaces');
        const style = document.createElement('style');
        style.setAttribute('data-plugin', '@local/standalone-chat');
        style.textContent = STYLES;
        document.head.appendChild(style);

        let disposed = false;
        let queued;
        let row;
        let chip;
        let button;
        let errorNode;
        let isSwitching = false;
        let switchError = '';

        function isScratchpad(workspace) {
          return typeof workspace?.path === 'string' &&
            /\/\.dsh\/scratchpad\/?$/.test(workspace.path.replace(/\\/g, '/'));
        }

        function currentWorkspace(items) {
          const snapshot = sessions.list.getSnapshot();
          const active = Object.values(snapshot.byId || {}).find(
            (session) => (session?.retainedBy?.mainView ?? 0) > 0
          );
          return active && items.find((workspace) => workspace.sessionIds?.includes(active.id));
        }

        function restoreChip() {
          if (!chip) return;
          chip.classList.remove('dsh-scope-button');
          chip.removeAttribute('data-dsh-project-active');
          chip.removeAttribute('data-dsh-scratchpad');
          chip = undefined;
        }

        function removeControls() {
          restoreChip();
          row?.classList.remove('dsh-scope-row');
          button?.remove();
          errorNode?.remove();
          row = button = errorNode = undefined;
        }

        async function startNoProjectChat() {
          if (disposed || isSwitching) return;
          isSwitching = true;
          switchError = '';
          reconcileDOM();
          try {
            const scratchpad = workspaces.list.getSnapshot().items.find(isScratchpad);
            if (!scratchpad) throw new Error('临时工作区尚未就绪，请重新加载插件后重试');
            // Native navigation owns session creation/reuse, retention, drafts and
            // composer enablement. Never bypass React's disabled input state.
            await uiWorkspace.openWorkspace(scratchpad.workspaceId);
          } catch (error) {
            switchError = '无法打开临时会话：' + (error?.message || String(error));
            console.error('[standalone-chat] ' + switchError);
          } finally {
            isSwitching = false;
            if (!disposed) reconcileDOM();
          }
        }

        function updateControls() {
          const nextRow = document.querySelector('[class*="heroWorkspaceRow"]');
          if (row !== nextRow) {
            removeControls();
            row = nextRow;
          }
          if (!row) return;
          const nativeChip = row.querySelector('button[aria-haspopup="menu"][class*="workspace"]');
          if (!nativeChip) return;
          if (chip !== nativeChip) {
            restoreChip();
            chip = nativeChip;
          }
          row.classList.add('dsh-scope-row');
          chip.classList.add('dsh-scope-button');

          if (!button || button.parentNode !== row) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'dsh-scope-button dsh-no-project';
            button.title = '使用独立临时工作区，不关联你的项目';
            button.innerHTML = '<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true"><rect x="2" y="2.5" width="12" height="8.5" rx="1.5"/><path d="M5 14h6M8 11v3"/></svg><span>不选择项目</span>';
            button.onclick = startNoProjectChat;
            row.insertBefore(button, nativeChip.nextSibling);
          }
          const selected = currentWorkspace(workspaces.list.getSnapshot().items || []);
          const temporary = isScratchpad(selected);
          chip.setAttribute('data-dsh-project-active', String(!!selected && !temporary));
          chip.setAttribute('data-dsh-scratchpad', String(temporary));
          button.setAttribute('aria-pressed', String(temporary));
          button.setAttribute('aria-busy', String(isSwitching));
          button.disabled = isSwitching;

          if (switchError) {
            if (!errorNode || errorNode.parentNode !== row) {
              errorNode = document.createElement('span');
              errorNode.className = 'dsh-scope-error';
              errorNode.setAttribute('role', 'alert');
              row.appendChild(errorNode);
            }
            if (errorNode.textContent !== switchError) errorNode.textContent = switchError;
          } else {
            errorNode?.remove();
            errorNode = undefined;
          }
        }

        // Keep plugin mutations outside its own observation; never re-render the
        // React-owned workspace trigger or inject children into its native menu.
        function reconcileDOM() {
          if (disposed) return;
          observer.disconnect();
          try {
            updateControls();
          } finally {
            if (!disposed) observer.observe(document.body, { childList: true, subtree: true });
          }
        }

        function scheduleUpdate() {
          if (disposed || queued !== undefined) return;
          queued = setTimeout(() => {
            queued = undefined;
            reconcileDOM();
          }, 0);
        }

        function onKeyDown(event) {
          if (event.repeat || event.isComposing) return;
          const isN = event.code === 'KeyN' || event.key === 'n' || event.key === 'N';
          if ((event.ctrlKey || event.metaKey) && event.altKey && isN) {
            event.preventDefault();
            event.stopPropagation();
            startNoProjectChat();
          }
        }

        const observer = new MutationObserver(reconcileDOM);
        const unsubscribeSessions = sessions.list.subscribe(scheduleUpdate);
        const unsubscribeWorkspaces = workspaces.list.subscribe(scheduleUpdate);
        window.addEventListener('keydown', onKeyDown, true);
        reconcileDOM();
        ctx.effect(() => () => {
          disposed = true;
          observer.disconnect();
          clearTimeout(queued);
          unsubscribeSessions();
          unsubscribeWorkspaces();
          window.removeEventListener('keydown', onKeyDown, true);
          removeControls();
          style.remove();
        }, 'standalone-chat: scope controls');
      },
    };
  },
});
