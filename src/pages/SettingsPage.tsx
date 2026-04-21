import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PageHeader, SettingsGroup, SettingsItem, Toggle } from '../components';
import { useSettings } from '../stores';
import './SettingsPage.css';

export function SettingsPage() {
  const { settings, setShowAnalysis, setAutoShowAnswer, setRandomOrder, setAlwaysOnTop } =
    useSettings();
  const [version, setVersion] = useState('0.1.0');

  useEffect(() => {
    invoke<string>('get_app_version')
      .then(setVersion)
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHeader title="设置" />
      <div className="content-body">
        <div className="settings-container">
          <SettingsGroup title="显示设置">
            <SettingsItem label="显示答案解析">
              <Toggle checked={settings.showAnalysis} onChange={setShowAnalysis} />
            </SettingsItem>
            <SettingsItem label="窗口置顶">
              <Toggle checked={settings.alwaysOnTop} onChange={setAlwaysOnTop} />
            </SettingsItem>
          </SettingsGroup>
          <SettingsGroup title="刷题设置">
            <SettingsItem label="单选自动提交">
              <Toggle checked={settings.autoShowAnswer} onChange={setAutoShowAnswer} />
            </SettingsItem>
            <SettingsItem label="随机顺序">
              <Toggle checked={settings.randomOrder} onChange={setRandomOrder} />
            </SettingsItem>
          </SettingsGroup>
          <SettingsGroup title="关于">
            <SettingsItem label="版本">
              <span className="settings-version">{version}</span>
            </SettingsItem>
            {/* <SettingsItem label="作者">
              <span className="settings-author">antness</span>
            </SettingsItem>
            <SettingsItem label="邮箱">
              <span className="settings-email">2816260070@qq.com</span>
            </SettingsItem> */}
          </SettingsGroup>
        </div>
      </div>
    </>
  );
}
