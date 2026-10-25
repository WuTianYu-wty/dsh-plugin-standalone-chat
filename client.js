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

    function LogoIcon(props) {
      const size = props.size || 48;
      return h(
        'svg',
        {
          viewBox: '0 0 64 64',
          width: size,
          height: size,
          fill: 'none',
          style: { display: 'inline-block', verticalAlign: 'middle' },
          'aria-hidden': 'true',
        },
        h('defs', null,
          h('linearGradient', { id: 'dshStandaloneLogoGrad', x1: '8', y1: '8', x2: '56', y2: '56', gradientUnits: 'userSpaceOnUse' },
            h('stop', { offset: '0%', stopColor: '#6366F1' }),
            h('stop', { offset: '100%', stopColor: '#06B6D4' })
          ),
          h('linearGradient', { id: 'dshStandaloneStarGrad', x1: '36', y1: '12', x2: '52', y2: '28', gradientUnits: 'userSpaceOnUse' },
            h('stop', { offset: '0%', stopColor: '#FDE047' }),
            h('stop', { offset: '100%', stopColor: '#F59E0B' })
          )
        ),
        h('rect', { x: '4', y: '4', width: '56', height: '56', rx: '16', fill: 'url(#dshStandaloneLogoGrad)' }),
        h('path', {
          d: 'M20 22C20 18.6863 22.6863 16 26 16H38C41.3137 16 44 18.6863 44 22V32C44 35.3137 41.3137 38 38 38H28L21 44V38H26C22.6863 38 20 35.3137 20 32V22Z',
          fill: '#FFFFFF',
          fillOpacity: '0.95'
        }),
        h('path', { d: 'M26 24H38', stroke: '#4F46E5', strokeWidth: '2.5', strokeLinecap: 'round' }),
        h('path', { d: 'M26 30H34', stroke: '#4F46E5', strokeWidth: '2.5', strokeLinecap: 'round' }),
        h('path', { d: 'M44 14L45.5 18.5L50 20L45.5 21.5L44 26L42.5 21.5L38 20L42.5 18.5Z', fill: 'url(#dshStandaloneStarGrad)' }),
        h('circle', { cx: '48', cy: '30', r: '1.5', fill: '#FDE047' })
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

      /* Hero quick start card */
      .dsh-standalone-hero-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 520px;
        margin: 0 auto;
        gap: 16px;
        animation: dshFadeIn 0.3s ease-out;
      }
      @keyframes dshFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .dsh-standalone-hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.12);
        border: 1px solid rgba(99, 102, 241, 0.28);
        color: #818cf8;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.3px;
        text-transform: uppercase;
      }
      .dsh-standalone-hero-card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
        padding: 20px 24px;
        border-radius: var(--dsw-radius-panel, 12px);
        background: var(--dsw-alias-bg-layer-1, rgba(255, 255, 255, 0.03));
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.08));
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
        gap: 10px;
      }
      .dsh-standalone-hero-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--dsw-alias-label-primary, #ffffff);
      }
      .dsh-standalone-hero-desc {
        margin: 0 0 6px 0;
        font-size: 13px;
        line-height: 20px;
        color: var(--dsw-alias-label-secondary, #94a3b8);
        max-width: 440px;
      }
      .dsh-standalone-hero-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 38px;
        padding: 0 22px;
        border-radius: var(--dsw-radius-md, 8px);
        border: none;
        background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%);
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(79, 70, 229, 0.35);
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
      }
      .dsh-standalone-hero-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(79, 70, 229, 0.5);
        opacity: 0.95;
      }
      .dsh-standalone-hero-btn:active {
        transform: translateY(0);
      }
      .dsh-standalone-hero-kbd {
        font-family: inherit;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.22);
        color: #ffffff;
        margin-left: 2px;
        font-weight: 500;
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
      inject: ['slots', 'sessions', 'uiWorkspace', 'workspaces', 'locale', 'shortcuts', 'layout'],
      apply(ctx) {
        // 1. Inject styling into document head
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-plugin', '@local/standalone-chat');
        styleEl.textContent = STYLES;
        document.head.appendChild(styleEl);

        ctx.effect(() => () => {
          styleEl.remove();
        });

        const isChinese = () => {
          try {
            const loc = ctx.get('locale')?.getLocale?.()?.id;
            if (loc) return loc.startsWith('zh');
          } catch (e) {}
          return (navigator.language || '').startsWith('zh');
        };

        // 2. Core function: Create and open a standalone session
        let isCreating = false;
        async function startStandaloneChat(options = {}) {
          if (isCreating) return;
          isCreating = true;
          try {
            const sessions = ctx.get('sessions') ?? ctx.sessions;
            const uiWorkspace = ctx.get('uiWorkspace') ?? ctx.uiWorkspace;
            if (!sessions || !uiWorkspace) {
              console.warn('[standalone-chat] sessions or uiWorkspace service not ready');
              return;
            }

            // Check if user is ALREADY looking at an empty blank session
            const list = sessions.list?.getSnapshot?.();
            if (list && list.byId) {
              const currentId = Object.values(list.byId).find(
                (s) => (s.retainedBy?.mainView ?? 0) > 0
              )?.id;
              const current = currentId ? list.byId[currentId] : undefined;
              if (current && current.blank) {
                // Already in a blank session! Just make sure it's open & focused
                uiWorkspace.openSession(current.id);
                return;
              }
            }

            // Derive scratchpad directory from host home if available
            const home = ctx.remote?.$host?.home || '';
            const scratchpadDir = home ? `${home}\\.dsh\\scratchpad` : undefined;

            const createOpts = {};
            if (scratchpadDir) {
              createOpts.cwd = scratchpadDir;
            }
            if (options.agentPreset) {
              createOpts.agentPreset = options.agentPreset;
            }

            const sessionId = await sessions.create(createOpts);
            uiWorkspace.openSession(sessionId);
          } catch (err) {
            console.error('[standalone-chat] Failed to create standalone session:', err);
          } finally {
            isCreating = false;
          }
        }

        // 3. Register global keyboard shortcut (Ctrl+Alt+N / Cmd+Alt+N)
        if (ctx.shortcuts) {
          ctx.effect(
            () =>
              ctx.shortcuts.register({
                id: 'no-project-chat.new',
                label: () => (isChinese() ? '新建无项目对话 (Claude模式)' : 'New Standalone Chat (Claude Mode)'),
                aliases: ['new chat without project', 'standalone chat', 'free chat', '自由对话'],
                defaults: {
                  'desktop:windows': { code: 'KeyN', modifiers: ['primary', 'alt'] },
                  'desktop:macos': { code: 'KeyN', modifiers: ['primary', 'alt'] },
                  'desktop:linux': { code: 'KeyN', modifiers: ['primary', 'alt'] },
                  'web:windows': { code: 'KeyN', modifiers: ['primary', 'alt'] },
                  'web:macos': { code: 'KeyN', modifiers: ['primary', 'alt'] },
                },
                regions: ['page', 'editable'],
                modals: [],
                resolve: () => ({
                  status: 'handled',
                  run: () => startStandaloneChat(),
                }),
              }),
            'standalone-chat: shortcut'
          );
        }

        // 4. Component: Sidebar Footer Button (beside Settings)
        function SidebarStandaloneChatButton(props) {
          const wide = props.wide !== false;
          const label = isChinese() ? '自由对话' : 'Direct Chat';
          const fullLabel = isChinese() ? '新建无项目对话' : 'New Standalone Chat';
          const tooltip = isChinese()
            ? '新建无项目对话 (无需选择项目，模仿 Claude / Codex 桌面端)'
            : 'New Standalone Chat (No project required, like Claude / Codex)';

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

        // 5. Component: Hero Quick Chat Card (replaces/augments empty state brand mark)
        function HeroStandaloneChatEntry(props) {
          const zh = isChinese();
          return h(
            'div',
            { className: 'dsh-standalone-hero-wrapper' },
            h(LogoIcon, { size: 52 }),
            h(
              'div',
              { className: 'dsh-standalone-hero-card' },
              h(
                'div',
                { className: 'dsh-standalone-hero-badge' },
                h(SparkleIcon, { size: 11 }),
                h('span', null, zh ? 'Claude & Codex 模式已就绪' : 'Claude & Codex Mode Ready')
              ),
              h(
                'h3',
                { className: 'dsh-standalone-hero-title' },
                zh ? '无需选择项目，直接开始对话' : 'Chat Freely Without a Project'
              ),
              h(
                'p',
                { className: 'dsh-standalone-hero-desc' },
                zh
                  ? '像 Claude 与 Codex 桌面端一样，无需选择或新建任何项目文件夹，即可随时向 DeepSeek 提问、讨论与构思。'
                  : 'Start chatting directly with DeepSeek without binding to any project folder.'
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-standalone-hero-btn',
                  onClick: (e) => {
                    e.stopPropagation();
                    startStandaloneChat();
                  },
                },
                h(ChatIcon, { size: 16 }),
                h('span', null, zh ? '立即开启自由对话' : 'Start Direct Chat'),
                h('kbd', { className: 'dsh-standalone-hero-kbd' }, 'Ctrl+Alt+N')
              )
            )
          );
        }

        // 6. Component: Floating prompt above composer when in empty state
        function EmptyStateFloatingHelper(props) {
          const sessions = ctx.get('sessions') ?? ctx.sessions;
          const [hasActiveSession, setHasActiveSession] = React.useState(true);

          React.useEffect(() => {
            if (!sessions || !sessions.list) return;
            const updateState = () => {
              const list = sessions.list.getSnapshot();
              if (!list || !list.byId) {
                setHasActiveSession(false);
                return;
              }
              const active = Object.values(list.byId).some(
                (s) => (s.retainedBy?.mainView ?? 0) > 0
              );
              setHasActiveSession(active);
            };

            updateState();
            return sessions.list.subscribe(updateState);
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

        // 7. Inject into slots
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

        // B. Hero Brand Mark Slot
        ctx.slots.inject('conversation.hero.brand.mark', () =>
          ctx.slots.register(
            {
              name: 'conversation.hero.brand.mark',
              id: 'standalone-chat-hero-mark',
              order: 10,
            },
            HeroStandaloneChatEntry
          )
        );

        // C. Shell Overlay Floating Helper (visible only when no session is active)
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'standalone-chat-floating-helper',
            },
            EmptyStateFloatingHelper
          )
        );

        // 8. Auto-Start on App Launch (Instant Chat Experience like Claude Desktop)
        // Automatically start a standalone chat if the app boots into a blank/no-session state!
        let autoStarted = false;
        const checkAutoStart = () => {
          if (autoStarted) return;
          const sessions = ctx.get('sessions') ?? ctx.sessions;
          const workspaces = ctx.get('workspaces') ?? ctx.workspaces;
          if (!sessions || !workspaces) return;

          const sessionsSnapshot = sessions.list?.getSnapshot?.();
          const workspacesSnapshot = workspaces.list?.getSnapshot?.();

          // Wait until session list and workspaces list are ready
          if (sessionsSnapshot?.phase !== 'ready' || workspacesSnapshot?.phase !== 'ready') {
            return;
          }

          const hasActive = Object.values(sessionsSnapshot.byId || {}).some(
            (s) => (s.retainedBy?.mainView ?? 0) > 0
          );

          if (!hasActive) {
            autoStarted = true;
            // Delay slightly so layout and DOM initialization finish settling
            setTimeout(() => {
              startStandaloneChat();
            }, 180);
          } else {
            autoStarted = true;
          }
        };

        const sessionsService = ctx.get('sessions') ?? ctx.sessions;
        const workspacesService = ctx.get('workspaces') ?? ctx.workspaces;
        if (sessionsService?.list && workspacesService?.list) {
          const offSessions = sessionsService.list.subscribe(checkAutoStart);
          const offWorkspaces = workspacesService.list.subscribe(checkAutoStart);
          checkAutoStart();

          ctx.effect(() => () => {
            offSessions();
            offWorkspaces();
          });
        }
      },
    };
  },
});
