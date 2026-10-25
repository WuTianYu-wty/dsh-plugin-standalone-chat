window.__ModuleLoader__.load({
  id: '@local/standalone-chat',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // SVG Icons
    function ChatIcon(props) {
      const size = props.size || 16;
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '1.25',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 },
          'aria-hidden': 'true',
        },
        h('path', { d: 'M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V10.5C14 11.3284 13.3284 12 12.5 12H5L2 14.5V3.5Z' }),
        h('path', { d: 'M5 6H11' }),
        h('path', { d: 'M5 8.5H9' })
      );
    }

    function SparkleIcon(props) {
      const size = props.size || 14;
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'currentColor',
          style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 },
          'aria-hidden': 'true',
        },
        h('path', {
          d: 'M8 1L9.5 5.5L14 7L9.5 8.5L8 13L6.5 8.5L2 7L6.5 5.5L8 1Z'
        })
      );
    }

    const STYLES = `
      .dsh-standalone-footer-btn {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 28px;
        padding: 0 10px;
        border-radius: var(--dsw-radius-sm, 6px);
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.12));
        background: var(--dsw-alias-bg-layer-1, rgba(255, 255, 255, 0.04));
        color: var(--dsw-alias-label-primary, #e2e8f0);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        user-select: none;
        transition: all 0.15s ease;
      }
      .dsh-standalone-footer-btn:hover {
        background: var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.1));
        border-color: var(--dsw-alias-brand-primary, #6366f1);
        color: #fff;
        transform: translateY(-0.5px);
      }
      .dsh-standalone-footer-btn:active {
        transform: translateY(0);
      }
      .dsh-standalone-rail-btn {
        box-sizing: border-box;
        width: 28px;
        height: 28px;
        border-radius: var(--dsw-radius-sm, 6px);
        border: none;
        background: transparent;
        color: var(--dsw-alias-label-secondary, #94a3b8);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.12s ease, color 0.12s ease;
      }
      .dsh-standalone-rail-btn:hover {
        background: var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.08));
        color: var(--dsw-alias-label-primary, #ffffff);
      }

      /* Floating helper above composer when in blank state */
      .dsh-standalone-floating-pill {
        position: fixed;
        bottom: 85px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 16px;
        border-radius: 999px;
        background: var(--dsw-alias-bg-layer-2, #1e293b);
        border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.15));
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        color: var(--dsw-alias-label-primary, #e2e8f0);
        font-size: 12px;
        animation: dshFloatIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
      }
      @keyframes dshFloatIn {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      .dsh-standalone-floating-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 999px;
        border: none;
        background: #4F46E5;
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.12s ease;
      }
      .dsh-standalone-floating-btn:hover {
        background: #4338ca;
      }
    `;

    return {
      inject: ['slots', 'uiWorkspace', 'sessions', 'workspaces'],
      apply(ctx) {
        // 1. Inject styling into document head
        try {
          if (typeof document !== 'undefined') {
            let styleEl = document.querySelector('style[data-plugin="@local/standalone-chat"]');
            if (!styleEl) {
              styleEl = document.createElement('style');
              styleEl.setAttribute('data-plugin', '@local/standalone-chat');
              styleEl.textContent = STYLES;
              document.head.appendChild(styleEl);
            }
          }
        } catch (e) {
          console.error('[standalone-chat] Failed to inject styles:', e);
        }

        const isChinese = () => {
          try {
            const loc = ctx.get('locale')?.getLocale?.()?.id;
            if (loc) return loc.startsWith('zh');
          } catch (e) {}
          return (navigator?.language || '').startsWith('zh');
        };

        // 2. Core function: Create and open a standalone session (Claude & Codex style)
        let isCreating = false;
        async function startStandaloneChat() {
          if (isCreating) return;
          isCreating = true;
          try {
            const uiWorkspace = ctx.get('uiWorkspace');
            const sessions = ctx.get('sessions');

            // If user is already on an empty blank session, don't create duplicate
            if (sessions?.list?.getSnapshot) {
              const list = sessions.list.getSnapshot();
              if (list && list.byId) {
                const currentId = Object.values(list.byId).find(
                  (s) => (s?.retainedBy?.mainView ?? 0) > 0
                )?.id;
                const current = currentId ? list.byId[currentId] : undefined;
                if (current && current.blank) {
                  uiWorkspace?.openSession?.(current.id);
                  return;
                }
              }
            }

            // Start standalone session directly via uiWorkspace
            if (uiWorkspace && typeof uiWorkspace.startSession === 'function') {
              uiWorkspace.startSession(undefined);
            } else if (sessions && typeof sessions.create === 'function') {
              const newId = await sessions.create({});
              if (newId && uiWorkspace?.openSession) {
                uiWorkspace.openSession(newId);
              }
            }
          } catch (err) {
            console.error('[standalone-chat] Failed to start standalone chat:', err);
          } finally {
            isCreating = false;
          }
        }

        // 3. Register global keyboard shortcut (Ctrl+Alt+N / Cmd+Alt+N) via native window listener
        if (typeof window !== 'undefined') {
          const handleGlobalKeyDown = (e) => {
            const isPrimary = e.ctrlKey || e.metaKey;
            if (isPrimary && e.altKey && (e.code === 'KeyN' || e.key === 'n' || e.key === 'N')) {
              e.preventDefault();
              e.stopPropagation();
              startStandaloneChat();
            }
          };
          window.addEventListener('keydown', handleGlobalKeyDown, true);
        }

        // 4. Component: Sidebar Footer Button (beside Settings)
        function SidebarStandaloneChatButton(props) {
          const wide = props?.wide !== false;
          const label = isChinese() ? '自由对话' : 'Direct Chat';
          const fullLabel = isChinese() ? '新建无项目对话 (Claude模式)' : 'New Standalone Chat (Claude Mode)';
          const tooltip = isChinese()
            ? '新建自由对话 (无需选择项目，模仿 Claude / Codex 桌面端，Ctrl+Alt+N)'
            : 'New Standalone Chat (No project required, like Claude / Codex, Ctrl+Alt+N)';

          if (wide) {
            return h(
              'button',
              {
                type: 'button',
                className: 'dsh-standalone-footer-btn',
                title: tooltip,
                'aria-label': fullLabel,
                onClick: (e) => {
                  e.stopPropagation();
                  startStandaloneChat();
                },
              },
              h(ChatIcon, { size: 14 }),
              h('span', null, label)
            );
          }

          return h(
            'button',
            {
              type: 'button',
              className: 'dsh-standalone-rail-btn',
              title: tooltip,
              'aria-label': fullLabel,
              onClick: (e) => {
                e.stopPropagation();
                startStandaloneChat();
              },
            },
            h(ChatIcon, { size: 16 })
          );
        }

        // 5. Component: Floating prompt above composer when in empty state
        function EmptyStateFloatingHelper() {
          const sessions = ctx.get('sessions');
          const [hasActiveSession, setHasActiveSession] = React.useState(true);

          React.useEffect(() => {
            if (!sessions || !sessions.list?.getSnapshot) return;
            const updateState = () => {
              const list = sessions.list.getSnapshot();
              if (!list || !list.byId) {
                setHasActiveSession(false);
                return;
              }
              const active = Object.values(list.byId).some(
                (s) => (s?.retainedBy?.mainView ?? 0) > 0
              );
              setHasActiveSession(active);
            };

            updateState();
            if (typeof sessions.list.subscribe === 'function') {
              return sessions.list.subscribe(updateState);
            }
          }, [sessions]);

          if (hasActiveSession) return null;

          const zh = isChinese();
          return h(
            'div',
            { className: 'dsh-standalone-floating-pill' },
            h(SparkleIcon, { size: 14 }),
            h(
              'span',
              null,
              zh
                ? '不想选择项目？可直接开启自由对话：'
                : 'Want to chat without choosing a project?'
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-standalone-floating-btn',
                onClick: () => startStandaloneChat(),
              },
              h(ChatIcon, { size: 12 }),
              h('span', null, zh ? '立即开始' : 'Start Now')
            )
          );
        }

        // 6. Register into slots
        // A. Sidebar Footer Action (beside settings)
        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register(
            {
              name: 'sidebar.footer.action',
              id: 'standalone-chat-footer-action',
              order: 50,
            },
            SidebarStandaloneChatButton
          )
        );

        // B. Shell Overlay Floating Helper (visible only when no session is active)
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'standalone-chat-floating-helper',
            },
            EmptyStateFloatingHelper
          )
        );
      },
    };
  },
});
