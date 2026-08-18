/* @ds-bundle: {"format":4,"namespace":"MecanuDesignSystem_bf03e0","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"CustomerMiniCard","sourcePath":"components/desktop/CustomerMiniCard.jsx"},{"name":"DataTable","sourcePath":"components/desktop/DataTable.jsx"},{"name":"MetricsCard","sourcePath":"components/desktop/MetricsCard.jsx"},{"name":"StatusTimeline","sourcePath":"components/desktop/StatusTimeline.jsx"},{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"AvatarGroup","sourcePath":"components/display/AvatarGroup.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"CardList","sourcePath":"components/display/Card.jsx"},{"name":"Divider","sourcePath":"components/display/Divider.jsx"},{"name":"ListItem","sourcePath":"components/display/ListItem.jsx"},{"name":"ProgressBar","sourcePath":"components/display/ProgressBar.jsx"},{"name":"Skeleton","sourcePath":"components/display/Skeleton.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"TimeWindow","sourcePath":"components/display/TimeWindow.jsx"},{"name":"ConnectionBanner","sourcePath":"components/feedback/ConnectionBanner.jsx"},{"name":"ErrorState","sourcePath":"components/feedback/ErrorState.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"StatusBanner","sourcePath":"components/feedback/StatusBanner.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"UpsellAlertCard","sourcePath":"components/feedback/UpsellAlertCard.jsx"},{"name":"Attachment","sourcePath":"components/forms/Attachment.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"DateRangePicker","sourcePath":"components/forms/DateRangePicker.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"BottomSheet","sourcePath":"components/mobile/BottomSheet.jsx"},{"name":"CameraTrigger","sourcePath":"components/mobile/CameraTrigger.jsx"},{"name":"EvidenceGrid","sourcePath":"components/mobile/EvidenceGrid.jsx"},{"name":"IncidentButton","sourcePath":"components/mobile/IncidentButton.jsx"},{"name":"OversizedButton","sourcePath":"components/mobile/OversizedButton.jsx"},{"name":"QuickCallButton","sourcePath":"components/mobile/QuickCallButton.jsx"},{"name":"SignatureCanvas","sourcePath":"components/mobile/SignatureCanvas.jsx"},{"name":"SlideToConfirm","sourcePath":"components/mobile/SlideToConfirm.jsx"},{"name":"TireSelector","sourcePath":"components/mobile/TireSelector.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"Breadcrumbs","sourcePath":"components/navigation/Breadcrumbs.jsx"},{"name":"FilterBar","sourcePath":"components/navigation/FilterBar.jsx"},{"name":"FilterChip","sourcePath":"components/navigation/FilterChip.jsx"},{"name":"SearchInput","sourcePath":"components/navigation/SearchInput.jsx"},{"name":"SidebarNav","sourcePath":"components/navigation/SidebarNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"76d9939efad4","components/brand/Icon.jsx":"ad9cc2488b25","components/brand/Logo.jsx":"c46628231146","components/desktop/CustomerMiniCard.jsx":"cbca3dd7de30","components/desktop/DataTable.jsx":"106e7d763523","components/desktop/MetricsCard.jsx":"bd2329505897","components/desktop/StatusTimeline.jsx":"42e5a8a70a70","components/display/Avatar.jsx":"56c592adc873","components/display/AvatarGroup.jsx":"ea5d2c6acfc8","components/display/Badge.jsx":"38b356e3d77f","components/display/Card.jsx":"91b57a2bb5a2","components/display/Divider.jsx":"089d1137107d","components/display/ListItem.jsx":"03425aa8c551","components/display/ProgressBar.jsx":"9212df95d5e3","components/display/Skeleton.jsx":"f6de9a9ca3f5","components/display/Tag.jsx":"71a8bb5a6664","components/display/TimeWindow.jsx":"23f4c9edd6a7","components/feedback/ConnectionBanner.jsx":"b232c25b258c","components/feedback/ErrorState.jsx":"3a6e322a29d0","components/feedback/Modal.jsx":"50ccfbcbc5a8","components/feedback/StatusBanner.jsx":"11f15f12f0f3","components/feedback/Toast.jsx":"e75b1c538bad","components/feedback/UpsellAlertCard.jsx":"62b4e53e9156","components/forms/Attachment.jsx":"ee207fe52920","components/forms/Checkbox.jsx":"f211baa88484","components/forms/DateRangePicker.jsx":"df474c218df8","components/forms/Input.jsx":"35e1fa0fe4b6","components/forms/Radio.jsx":"513a07bf9180","components/forms/Select.jsx":"539a607cee54","components/forms/Switch.jsx":"858bdd0810d0","components/mobile/BottomSheet.jsx":"c83bfdf9b461","components/mobile/CameraTrigger.jsx":"75932ad8e386","components/mobile/EvidenceGrid.jsx":"9ea271aa8a77","components/mobile/IncidentButton.jsx":"b4d07aa20aaa","components/mobile/OversizedButton.jsx":"fa08d5fe9cbe","components/mobile/QuickCallButton.jsx":"a23968a86263","components/mobile/SignatureCanvas.jsx":"3a9fbf315833","components/mobile/SlideToConfirm.jsx":"9a72486b7ee3","components/mobile/TireSelector.jsx":"a14b1bb6f77b","components/navigation/BottomNav.jsx":"3da5ca5aac7c","components/navigation/Breadcrumbs.jsx":"ffb34cff03c4","components/navigation/FilterBar.jsx":"740f09924d2b","components/navigation/FilterChip.jsx":"d2e1b82b4a5c","components/navigation/SearchInput.jsx":"f34a658b940e","components/navigation/SidebarNav.jsx":"10143e30c5a0","components/navigation/Tabs.jsx":"3bcad542e9ec"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MecanuDesignSystem_bf03e0 = window.MecanuDesignSystem_bf03e0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Icon.jsx
try { (() => {
const SIZES = {
  sm: "var(--mecanu-icon-sm)",
  md: "var(--mecanu-icon-md)",
  lg: "var(--mecanu-icon-lg)",
  xl: "var(--mecanu-icon-xl)"
};
function Icon({
  name,
  size = "lg",
  filled = false,
  color,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "mecanu-icon" + (filled ? " is-filled" : ""),
    "aria-hidden": "true",
    style: {
      fontSize: SIZES[size] || size,
      color,
      ...style
    }
  }, name);
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-button", `
.mcn-btn{font-family:var(--mecanu-font-family);font-weight:var(--mecanu-font-weight-bold);border:none;border-radius:var(--mecanu-radius-200);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:var(--mecanu-space-2);transition:background-color 200ms var(--mecanu-ease-linear);white-space:nowrap}
.mcn-btn:disabled{background:var(--mecanu-neutral-25);color:var(--mecanu-text-disabled-light);cursor:not-allowed}
.mcn-btn--primary{background:var(--mecanu-brand-primary-dark);color:var(--mecanu-text-primary-light)}
.mcn-btn--primary:hover:not(:disabled){background:var(--mecanu-brand-hover)}
.mcn-btn--primary:active:not(:disabled){background:var(--mecanu-brand-active)}
.mcn-btn--secondary{background:var(--mecanu-neutral-900);color:var(--mecanu-neutral-0)}
.mcn-btn--secondary:hover:not(:disabled){background:var(--mecanu-neutral-800)}
.mcn-btn--secondary:active:not(:disabled){background:var(--mecanu-neutral-700)}
.mcn-btn--tertiary{background:transparent;color:var(--mecanu-text-primary-light)}
.mcn-btn--tertiary:hover:not(:disabled){background:var(--mecanu-neutral-25)}
.mcn-btn--tertiary:active:not(:disabled){background:var(--mecanu-neutral-25)}
.mcn-btn--negative{background:var(--mecanu-alert);color:var(--mecanu-neutral-0)}
.mcn-btn--negative:hover:not(:disabled){background:#C91F2A}
.mcn-btn--negative:active:not(:disabled){background:#A81823}
.mcn-btn:focus-visible{outline:2px solid var(--mecanu-brand-primary-light);outline-offset:2px}
`);
const BTN_SIZES = {
  compact: {
    height: 36,
    padding: "0 12px",
    fontSize: 14
  },
  default: {
    height: 48,
    padding: "0 16px",
    fontSize: 16
  },
  large: {
    height: 56,
    padding: "0 24px",
    fontSize: 16
  }
};
function Button({
  kind = "primary",
  size = "default",
  icon,
  iconFilled,
  children,
  disabled,
  onClick,
  fullWidth,
  "aria-label": ariaLabel,
  style,
  type = "button"
}) {
  const s = BTN_SIZES[size] || BTN_SIZES.default;
  const iconOnly = icon && !children;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    className: "mcn-btn mcn-btn--" + kind,
    disabled: disabled,
    onClick: onClick,
    "aria-label": ariaLabel,
    style: {
      height: s.height,
      padding: iconOnly ? 0 : s.padding,
      width: iconOnly ? s.height : fullWidth ? "100%" : undefined,
      fontSize: s.fontSize,
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "md",
    filled: iconFilled
  }) : null, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
function Logo({
  variant = "dark",
  height = 24,
  style
}) {
  const color = variant === "light" ? "var(--mecanu-neutral-0)" : "var(--mecanu-neutral-900)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color,
      ...style
    },
    "aria-label": "Mecanu"
  }, /*#__PURE__*/React.createElement("svg", {
    style: {
      height,
      width: "auto",
      display: "block"
    },
    viewBox: "0 0 346 86",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0.592247 17.2255C0.592247 11.2656 0.454709 6.40592 0.133789 1.68381H9.02787L9.48633 10.853H9.85309C13.0623 5.71824 18.3804 0.858585 27.8705 0.858585C35.7101 0.858585 41.6242 5.35147 44.0999 11.724H44.2374C45.7962 8.7899 47.9968 6.26839 50.61 4.20533C54.0484 1.59212 57.8078 0.170898 63.2634 0.170898C70.828 0.170898 82.0602 5.16809 82.0602 25.2027V59.1744H71.9741V26.4864C71.9741 15.3917 67.9397 8.69821 59.5958 8.69821C53.6817 8.69821 49.0971 13.0994 47.3091 18.2341C46.7589 19.9304 46.4839 21.7184 46.4839 23.4606V59.1286H36.3978V24.5609C36.3978 15.3917 32.3634 8.69821 24.3862 8.69821C17.8303 8.69821 13.0623 13.9705 11.4119 19.1969C10.8159 20.8473 10.5408 22.5895 10.5866 24.3316V59.1744H0.500555V17.2255H0.592247Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M98.106 32.217C98.381 46.4292 107.963 52.2516 119.103 52.2516C127.08 52.2516 131.894 50.9221 136.066 49.2717L137.946 56.7904C134.003 58.4408 127.31 60.3664 117.59 60.3664C98.7478 60.3664 87.4697 48.6757 87.4697 31.2543C87.4697 13.8329 98.3352 0.125 116.169 0.125C136.158 0.125 141.476 16.7212 141.476 27.3115C141.476 28.962 141.339 30.5666 141.109 32.217H98.106ZM130.748 24.79C130.886 18.0965 127.86 7.7354 115.298 7.7354C104.02 7.7354 99.1146 17.5005 98.2435 24.79H130.748Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M190.807 57.1113C188.102 58.5325 182.05 60.458 174.348 60.458C157.064 60.458 145.786 48.6298 145.786 30.9792C145.786 13.191 157.844 0.30835 176.549 0.30835C182.692 0.30835 188.148 1.86711 190.99 3.28832L188.606 11.403C186.13 9.98181 182.188 8.65228 176.549 8.65228C163.391 8.65228 156.285 18.4174 156.285 30.4749C156.285 43.816 164.812 52.0682 176.182 52.0682C182.096 52.0682 185.993 50.5095 188.973 49.2258L190.807 57.1113Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M228.951 59.1742L228.125 51.7472H227.759C224.549 56.4693 218.406 60.5496 210.246 60.5496C198.647 60.5496 192.732 52.3432 192.732 43.9534C192.732 30.0163 205.065 22.3601 227.071 22.4976V21.3056C227.208 16.5376 225.925 7.96449 214.188 7.96449C208.87 7.96449 203.277 9.61493 199.243 12.274L196.859 5.35128C201.627 2.23377 208.458 0.216553 215.701 0.216553C233.214 0.216553 237.478 12.274 237.432 23.8271V45.4205C237.524 50.4177 237.753 55.3232 238.441 59.1742H228.951ZM227.346 29.7871C215.976 29.5578 203.048 31.5751 203.048 42.8073C203.048 49.5925 207.541 52.8475 212.859 52.8475C220.332 52.8475 225.054 48.0795 226.704 43.174C227.071 42.1196 227.254 40.9734 227.3 39.8273V29.7871H227.346Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M242.749 17.2252C242.749 11.2653 242.612 6.40565 242.291 1.68353H251.414L252.01 11.1736H252.331C255.174 5.71796 261.775 0.354004 271.22 0.354004C279.105 0.354004 291.392 5.12196 291.392 24.8356V59.1741H281.031V25.8901C281.031 16.5834 277.592 8.83547 267.827 8.83547C260.996 8.83547 255.678 13.741 253.89 19.5634C253.386 21.1221 253.156 22.7726 253.202 24.4689V59.1741H242.841V17.2252H242.749Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M344.711 43.4036C344.711 49.3636 344.849 54.6358 345.17 59.1746H335.909L335.313 49.6845H335.129C332.424 54.3149 326.373 60.4124 316.195 60.4124C307.209 60.4124 296.39 55.4152 296.39 35.1055V1.36304H306.751V33.3175C306.751 44.2747 310.098 51.7017 319.588 51.7017C326.602 51.7017 331.462 46.7962 333.387 42.1658C334.029 40.4695 334.35 38.6356 334.35 36.8018V1.36304H344.711V43.4036Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M286.165 83.1975C286.165 82.0513 286.899 81.272 287.999 81.272C289.099 81.272 289.787 82.0972 289.833 83.1975C289.879 84.2061 289.099 85.0772 288.091 85.123C287.082 85.1689 286.211 84.3895 286.165 83.3809C286.165 83.335 286.165 83.2433 286.165 83.1975Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M303.312 84.1604C301.845 84.8023 300.24 85.1232 298.682 85.0773C294.005 85.0773 290.979 81.9598 290.979 77.6962C290.979 73.1574 294.28 69.9482 299.278 69.9482C300.699 69.9482 302.12 70.2233 303.404 70.8193L302.808 72.8824C301.753 72.3322 300.515 72.0571 299.323 72.103C295.747 72.103 293.73 74.487 293.73 77.5128C293.73 80.8595 296.114 82.9226 299.232 82.9226C300.515 82.9226 301.753 82.6475 302.899 82.1432L303.312 84.1604Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M319.724 77.3294C319.724 82.6017 315.69 85.0773 311.885 85.0773C307.575 85.0773 304.32 82.0515 304.32 77.6503C304.32 72.9741 307.713 69.9482 312.114 69.9482C316.699 69.9482 319.724 73.1574 319.724 77.3294ZM307.071 77.5586C307.071 80.9971 309.317 83.0601 311.977 83.0601C314.636 83.0601 316.974 81.0429 316.974 77.4211C316.974 74.8996 315.507 71.9196 312.068 71.9196C308.721 71.9655 307.071 74.6704 307.071 77.5586Z",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M322.2 74.1202C322.2 72.6531 322.154 71.3695 322.062 70.1316H324.355L324.492 72.7907H324.584C324.584 72.7907 326.83 69.9482 329.49 69.9482C331.461 69.9482 333.845 73.1116 333.845 73.1116H333.891C334.303 72.3781 334.853 71.6904 335.541 71.1861C336.504 70.4067 337.742 69.9941 339.025 70.0399C340.905 70.0399 344.114 71.2319 344.114 76.6417V84.7106H341.73V76.8251C341.73 73.7076 340.447 72.1488 338.292 72.1488C336.641 72.1488 335.404 73.3408 334.899 74.5787C334.762 74.9913 334.67 75.4497 334.67 75.9082V84.7106H332.011V76.3208C332.011 73.7993 330.773 72.1488 328.71 72.1488C326.876 72.1488 325.593 73.6159 325.134 74.8537C324.997 75.2664 324.905 75.7248 324.905 76.1833V84.7106H322.246L322.2 74.1202Z",
    fill: "currentColor"
  })));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/desktop/DataTable.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-table", `
.mcn-table-wrap{border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-200);overflow:auto;background:var(--mecanu-neutral-0);font-family:var(--mecanu-font-family)}
.mcn-table{width:100%;border-collapse:collapse;font-size:var(--mecanu-font-size-h5);line-height:var(--mecanu-line-height-h5)}
.mcn-table th{position:sticky;top:0;background:var(--mecanu-neutral-0);text-align:left;font-size:var(--mecanu-font-size-label);line-height:var(--mecanu-line-height-label);font-weight:var(--mecanu-font-weight-black);text-transform:uppercase;letter-spacing:.04em;color:var(--mecanu-text-secondary-light);padding:var(--mecanu-space-3) var(--mecanu-space-4);border-bottom:1px solid var(--mecanu-border);white-space:nowrap;cursor:pointer;user-select:none}
.mcn-table td{padding:14px var(--mecanu-space-4);border-bottom:1px solid var(--mecanu-border-subtle);white-space:nowrap}
.mcn-table tr:last-child td{border-bottom:none}
.mcn-table tbody tr{transition:background-color 200ms var(--mecanu-ease-linear)}
.mcn-table tbody tr:hover{background:var(--mecanu-bg-secondary-light)}
.mcn-table tbody tr.is-selected{background:var(--mecanu-electric-100)}
.mcn-table.is-zebra tbody tr:nth-child(even){background:var(--mecanu-bg-secondary-light)}
.mcn-table tbody tr.is-clickable{cursor:pointer}
`);
function DataTable({
  columns = [],
  rows = [],
  zebra = false,
  selectedId,
  onRowClick,
  getRowId = (r, i) => r.id != null ? r.id : i,
  emptyText = "Sin resultados",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-table-wrap",
    style: style
  }, /*#__PURE__*/React.createElement("table", {
    className: "mcn-table" + (zebra ? " is-zebra" : "")
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      width: c.width
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      textAlign: "center",
      color: "var(--mecanu-text-disabled-light)",
      padding: "var(--mecanu-space-8)"
    }
  }, emptyText)) : rows.map((r, i) => {
    const id = getRowId(r, i);
    return /*#__PURE__*/React.createElement("tr", {
      key: id,
      className: (id === selectedId ? "is-selected " : "") + (onRowClick ? "is-clickable" : ""),
      onClick: () => onRowClick && onRowClick(r)
    }, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key
    }, c.render ? c.render(r) : r[c.key])));
  }))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/desktop/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/desktop/MetricsCard.jsx
try { (() => {
function MetricsCard({
  value,
  label,
  delta,
  deltaDirection,
  style
}) {
  const up = deltaDirection === "up";
  const deltaColor = deltaDirection ? up ? "var(--mecanu-positive)" : "var(--mecanu-alert)" : "var(--mecanu-text-secondary-light)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--mecanu-bg-secondary-light)",
      borderRadius: "var(--mecanu-radius-200)",
      padding: "var(--mecanu-space-5) var(--mecanu-space-6)",
      fontFamily: "var(--mecanu-font-family)",
      minWidth: 180,
      flex: "1 1 0",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--mecanu-font-size-display)",
      lineHeight: "var(--mecanu-line-height-display)",
      fontWeight: 700
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--mecanu-space-2)",
      marginTop: "var(--mecanu-space-1)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--mecanu-font-size-caption)",
      lineHeight: "var(--mecanu-line-height-caption)",
      color: "var(--mecanu-text-secondary-light)"
    }
  }, label), delta ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      whiteSpace: "nowrap",
      flex: "none",
      fontSize: "var(--mecanu-font-size-caption)",
      fontWeight: 700,
      color: deltaColor
    }
  }, deltaDirection ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: up ? "arrow_upward" : "arrow_downward",
    size: "sm"
  }) : null, delta) : null));
}
Object.assign(__ds_scope, { MetricsCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/desktop/MetricsCard.jsx", error: String((e && e.message) || e) }); }

// components/desktop/StatusTimeline.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-timeline", `
@keyframes mcn-step-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(65,148,104,.35)} 50%{box-shadow:0 0 0 6px rgba(65,148,104,.12)} }
.mcn-timeline{display:flex;align-items:flex-start;font-family:var(--mecanu-font-family)}
.mcn-timeline .step{display:flex;flex-direction:column;align-items:center;gap:var(--mecanu-space-2);flex:1;min-width:0;position:relative}
.mcn-timeline .bar{position:absolute;top:11px;left:calc(50% + 16px);right:calc(-50% + 16px);height:2px;background:var(--mecanu-neutral-200)}
.mcn-timeline .step.is-done .bar{background:var(--mecanu-brand-primary-light)}
.mcn-timeline .dot{width:24px;height:24px;border-radius:999px;background:var(--mecanu-neutral-200);color:var(--mecanu-neutral-0);display:flex;align-items:center;justify-content:center;flex:none;z-index:1}
.mcn-timeline .step.is-done .dot{background:var(--mecanu-brand-primary-light)}
.mcn-timeline .step.is-current .dot{background:var(--mecanu-brand-primary-light);animation:mcn-step-pulse 1.8s var(--mecanu-ease-linear) infinite}
.mcn-timeline .lbl{font-size:var(--mecanu-font-size-caption);line-height:var(--mecanu-line-height-caption);color:var(--mecanu-text-disabled-light);text-align:center}
.mcn-timeline .step.is-done .lbl,.mcn-timeline .step.is-current .lbl{color:var(--mecanu-text-primary-light);font-weight:700}
`);
function StatusTimeline({
  steps = ["Recogida", "Tránsito", "En Taller", "Devolución"],
  current = 0,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-timeline",
    style: style
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "step" + (i < current ? " is-done" : i === current ? " is-current" : "")
  }, i < steps.length - 1 ? /*#__PURE__*/React.createElement("span", {
    className: "bar"
  }) : null, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, i < current ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 6.5 L4.8 9 L10 3.5",
    fill: "none",
    stroke: "white",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "var(--mecanu-neutral-0)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, s))));
}
Object.assign(__ds_scope, { StatusTimeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/desktop/StatusTimeline.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
function Avatar({
  name = "",
  src,
  size = 40,
  square = false,
  style
}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  const radius = square ? "var(--mecanu-radius-200)" : "var(--mecanu-radius-full)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: radius,
      background: "var(--mecanu-bg-tertiary-light)",
      color: "var(--mecanu-text-secondary-light)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--mecanu-font-family)",
      fontWeight: 700,
      fontSize: size * 0.375,
      overflow: "hidden",
      flex: "none",
      ...style
    },
    "aria-label": name
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/desktop/CustomerMiniCard.jsx
try { (() => {
function CustomerMiniCard({
  name,
  phone,
  emergencyContact,
  history = [],
  style
}) {
  const row = {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--mecanu-space-2)",
    fontSize: "var(--mecanu-font-size-h5)",
    lineHeight: "var(--mecanu-line-height-h5)",
    color: "var(--mecanu-text-secondary-light)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--mecanu-neutral-0)",
      borderRadius: "var(--mecanu-radius-200)",
      boxShadow: "var(--mecanu-shadow-shallow-down)",
      border: "1px solid var(--mecanu-border-subtle)",
      padding: "var(--mecanu-space-3)",
      fontFamily: "var(--mecanu-font-family)",
      width: 280,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--mecanu-space-3)",
      marginBottom: "var(--mecanu-space-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    size: 40
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: "var(--mecanu-font-size-h4)",
      lineHeight: "var(--mecanu-line-height-h4)"
    }
  }, name)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--mecanu-space-2)"
    }
  }, phone ? /*#__PURE__*/React.createElement("span", {
    style: row
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "call",
    size: "sm"
  }), phone) : null, emergencyContact ? /*#__PURE__*/React.createElement("span", {
    style: row
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "emergency",
    size: "sm"
  }), emergencyContact) : null, history.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--mecanu-border-subtle)",
      paddingTop: "var(--mecanu-space-2)",
      marginTop: "var(--mecanu-space-1)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--mecanu-font-size-label)",
      lineHeight: "var(--mecanu-line-height-label)",
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: ".04em",
      color: "var(--mecanu-text-secondary-light)"
    }
  }, "Historial"), history.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...row,
      marginTop: "var(--mecanu-space-1)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "history",
    size: "sm",
    style: {
      margin: "2px -2px 2px -2px"
    }
  }), h))) : null));
}
Object.assign(__ds_scope, { CustomerMiniCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/desktop/CustomerMiniCard.jsx", error: String((e && e.message) || e) }); }

// components/display/AvatarGroup.jsx
try { (() => {
function AvatarGroup({
  names = [],
  max = 4,
  size = 32,
  style
}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      ...style
    }
  }, shown.map((n, i) => /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    key: n + i,
    name: n,
    size: size,
    style: {
      marginLeft: i === 0 ? 0 : -size * 0.25,
      border: "2px solid var(--mecanu-neutral-0)",
      boxSizing: "content-box"
    }
  })), rest > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: -size * 0.25,
      width: size,
      height: size,
      borderRadius: 999,
      background: "var(--mecanu-neutral-900)",
      color: "var(--mecanu-neutral-0)",
      border: "2px solid var(--mecanu-neutral-0)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--mecanu-font-family)",
      fontWeight: 700,
      fontSize: size * 0.34,
      boxSizing: "content-box"
    }
  }, "+", rest) : null);
}
Object.assign(__ds_scope, { AvatarGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/AvatarGroup.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-badge", `
.mcn-badge{display:inline-flex;align-items:center;gap:var(--mecanu-space-1);border-radius:var(--mecanu-radius-full);font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-caption);line-height:var(--mecanu-line-height-caption);font-weight:var(--mecanu-font-weight-bold);padding:2px 10px;white-space:nowrap}
`);
const KINDS = {
  info: {
    bg: "#E3EDFB",
    fg: "#1D4E9C",
    dot: "var(--mecanu-info)"
  },
  warning: {
    bg: "#FDEBDD",
    fg: "#9C420B",
    dot: "var(--mecanu-warning)"
  },
  positive: {
    bg: "#E4FBDA",
    fg: "var(--mecanu-positive)",
    dot: "var(--mecanu-positive)"
  },
  alert: {
    bg: "#FCE0E2",
    fg: "#A81823",
    dot: "var(--mecanu-alert)"
  },
  neutral: {
    bg: "var(--mecanu-neutral-25)",
    fg: "var(--mecanu-neutral-700)",
    dot: "var(--mecanu-neutral-300)"
  },
  brand: {
    bg: "var(--mecanu-electric-100)",
    fg: "var(--mecanu-emerald-800)",
    dot: "var(--mecanu-electric-600)"
  }
};
function Badge({
  kind = "neutral",
  dot = true,
  icon,
  children,
  style
}) {
  const k = KINDS[kind] || KINDS.neutral;
  return /*#__PURE__*/React.createElement("span", {
    className: "mcn-badge",
    style: {
      background: k.bg,
      color: k.fg,
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "sm"
  }) : dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: k.dot,
      flex: "none"
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-card", `
.mcn-card{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--mecanu-space-4);border-radius:var(--mecanu-radius-300);padding:var(--mecanu-space-4) var(--mecanu-space-5);font-family:var(--mecanu-font-family);border:1px solid transparent}
.mcn-card.is-light{background:var(--mecanu-neutral-0);border-color:var(--mecanu-border)}
.mcn-card.is-dark{background:var(--mecanu-bg-tertiary-dark);color:var(--mecanu-text-primary-dark)}
.mcn-card.is-tappable{cursor:pointer;transition:background-color 200ms var(--mecanu-ease-linear)}
.mcn-card.is-light.is-tappable:hover{background:var(--mecanu-bg-secondary-light)}
.mcn-card.is-dark.is-tappable:hover{background:var(--mecanu-neutral-800)}
.mcn-cardlist{display:flex;flex-direction:column;gap:var(--mecanu-space-2)}
`);
function Card({
  label,
  value,
  dark = false,
  trailing,
  trailingCaption,
  onClick,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-card " + (dark ? "is-dark" : "is-light") + (onClick ? " is-tappable" : ""),
    onClick: onClick,
    role: onClick ? "button" : undefined,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, label ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--mecanu-font-size-h5)",
      lineHeight: "var(--mecanu-line-height-h5)",
      color: dark ? "var(--mecanu-text-secondary-dark)" : "var(--mecanu-text-secondary-light)",
      marginBottom: 4
    }
  }, label) : null, value != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--mecanu-font-size-h2)",
      lineHeight: "var(--mecanu-line-height-h2)",
      fontWeight: 700
    }
  }, value) : null, children), trailing || trailingCaption ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 6,
      flex: "none"
    },
    onClick: e => e.stopPropagation()
  }, trailing, trailingCaption ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--mecanu-font-size-caption)",
      lineHeight: "var(--mecanu-line-height-caption)",
      color: dark ? "var(--mecanu-text-secondary-dark)" : "var(--mecanu-text-secondary-light)"
    }
  }, trailingCaption) : null) : null);
}
function CardList({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-cardlist",
    style: style
  }, children);
}
Object.assign(__ds_scope, { Card, CardList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Divider.jsx
try { (() => {
function Divider({
  vertical = false,
  spacing = "var(--mecanu-space-4)",
  style
}) {
  return vertical ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      width: 1,
      alignSelf: "stretch",
      background: "var(--mecanu-border-subtle)",
      margin: "0 " + spacing,
      ...style
    }
  }) : /*#__PURE__*/React.createElement("hr", {
    style: {
      border: "none",
      borderTop: "1px solid var(--mecanu-border-subtle)",
      margin: spacing + " 0",
      ...style
    }
  });
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Divider.jsx", error: String((e && e.message) || e) }); }

// components/display/ListItem.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-listitem", `
@keyframes mcn-spin { to { transform: rotate(360deg) } }
.mcn-li{display:flex;align-items:center;gap:var(--mecanu-space-3);padding:14px var(--mecanu-space-4);background:var(--mecanu-neutral-0);font-family:var(--mecanu-font-family);text-align:left;width:100%;border:none;position:relative}
.mcn-li.is-tappable{cursor:pointer;transition:background-color 200ms var(--mecanu-ease-linear)}
.mcn-li.is-tappable:hover{background:var(--mecanu-bg-secondary-light)}
.mcn-li.has-divider::after{content:"";position:absolute;left:var(--mecanu-space-4);right:var(--mecanu-space-4);bottom:0;height:1px;background:var(--mecanu-border-subtle)}
.mcn-li .spin{width:20px;height:20px;border-radius:999px;border:2.5px solid var(--mecanu-neutral-25);border-top-color:var(--mecanu-brand-primary-light);animation:mcn-spin .9s linear infinite;flex:none}
`);
function ListItem({
  title,
  description,
  leadingIcon,
  leadingAvatar,
  trailingText,
  chevron = false,
  badgeCount,
  loading = false,
  control,
  divider = true,
  onClick,
  style
}) {
  const Tag = onClick ? "button" : "div";
  return /*#__PURE__*/React.createElement(Tag, {
    type: onClick ? "button" : undefined,
    onClick: onClick,
    className: "mcn-li" + (onClick ? " is-tappable" : "") + (divider ? " has-divider" : ""),
    style: style
  }, leadingAvatar ? /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: leadingAvatar,
    size: 40
  }) : leadingIcon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: leadingIcon,
    size: "lg",
    color: "var(--mecanu-text-secondary-light)"
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--mecanu-font-size-h4)",
      lineHeight: "var(--mecanu-line-height-h4)",
      fontWeight: 700,
      color: "var(--mecanu-text-primary-light)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, title), description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--mecanu-font-size-caption)",
      lineHeight: "var(--mecanu-line-height-caption)",
      color: "var(--mecanu-text-secondary-light)"
    }
  }, description) : null), trailingText ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--mecanu-font-size-h5)",
      lineHeight: "var(--mecanu-line-height-h5)",
      color: "var(--mecanu-text-secondary-light)",
      flex: "none"
    }
  }, trailingText) : null, badgeCount != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      background: "var(--mecanu-warning)",
      color: "var(--mecanu-neutral-0)",
      fontSize: "var(--mecanu-font-size-caption)",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 6px",
      flex: "none"
    }
  }, badgeCount) : null, loading ? /*#__PURE__*/React.createElement("span", {
    className: "spin",
    "aria-label": "Cargando"
  }) : null, control ? /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      display: "inline-flex"
    },
    onClick: e => e.stopPropagation()
  }, control) : null, chevron ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron_right",
    size: "md",
    color: "var(--mecanu-text-secondary-light)"
  }) : null);
}
Object.assign(__ds_scope, { ListItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ListItem.jsx", error: String((e && e.message) || e) }); }

// components/display/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  warningThreshold,
  label,
  showValue = false,
  style
}) {
  const warn = warningThreshold != null && value >= warningThreshold;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--mecanu-font-family)",
      ...style
    }
  }, label || showValue ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "var(--mecanu-space-1)",
      fontSize: "var(--mecanu-font-size-caption)",
      lineHeight: "var(--mecanu-line-height-caption)",
      color: "var(--mecanu-text-secondary-light)"
    }
  }, /*#__PURE__*/React.createElement("span", null, label), showValue ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: warn ? "var(--mecanu-warning)" : "var(--mecanu-text-primary-light)"
    }
  }, Math.round(value), "%") : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      borderRadius: "var(--mecanu-radius-full)",
      background: "var(--mecanu-bg-tertiary-light)",
      overflow: "hidden"
    },
    role: "progressbar",
    "aria-valuenow": value
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: Math.min(100, Math.max(0, value)) + "%",
      height: "100%",
      borderRadius: "var(--mecanu-radius-full)",
      background: warn ? "var(--mecanu-warning)" : "var(--mecanu-brand-primary-light)",
      transition: "width 500ms var(--mecanu-ease-accelerate-decelerate)"
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/display/Skeleton.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-skeleton", `
@keyframes mcn-shimmer { 0%{background-color:var(--mecanu-neutral-25)} 50%{background-color:var(--mecanu-neutral-25)} 100%{background-color:var(--mecanu-neutral-25)} }
.mcn-skeleton{display:block;background:var(--mecanu-neutral-25);border-radius:var(--mecanu-radius-100);animation:mcn-shimmer 1.4s var(--mecanu-ease-linear) infinite}
`);
function Skeleton({
  width = "100%",
  height = 16,
  circle = false,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "mcn-skeleton",
    style: {
      width,
      height,
      borderRadius: circle ? "999px" : undefined,
      ...style
    },
    "aria-hidden": "true"
  });
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-tag", `
.mcn-tag{display:inline-flex;align-items:center;gap:var(--mecanu-space-1);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-100);background:var(--mecanu-neutral-0);font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-caption);line-height:var(--mecanu-line-height-caption);color:var(--mecanu-text-primary-light);padding:3px 8px;white-space:nowrap}
.mcn-tag button{border:none;background:none;padding:0;margin:0;cursor:pointer;display:inline-flex;color:var(--mecanu-text-secondary-light)}
.mcn-tag button:hover{color:var(--mecanu-text-primary-light)}
`);
function Tag({
  children,
  onClose,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "mcn-tag",
    style: style
  }, children, onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Quitar",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "close",
    size: "sm"
  })) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/display/TimeWindow.jsx
try { (() => {
function TimeWindow({
  start = "10:00",
  end,
  date,
  size = "default",
  style
}) {
  // Regla dura: si no se pasa fin, se ofrece una ventana de 1 hora desde el inicio.
  const computedEnd = end || (() => {
    const [h, m] = start.split(":").map(Number);
    return String((h + 1) % 24).padStart(2, "0") + ":" + String(m || 0).padStart(2, "0");
  })();
  const big = size === "large";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--mecanu-space-2)",
      fontFamily: "var(--mecanu-font-family)",
      fontSize: big ? "var(--mecanu-font-size-h4)" : "var(--mecanu-font-size-h5)",
      lineHeight: big ? "var(--mecanu-line-height-h4)" : "var(--mecanu-line-height-h5)",
      fontWeight: 700,
      color: "var(--mecanu-text-primary-light)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "schedule",
    size: big ? "md" : "sm",
    color: "var(--mecanu-text-secondary-light)"
  }), date ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: "var(--mecanu-text-secondary-light)"
    }
  }, date, " \xB7") : null, start, "\u2013", computedEnd);
}
Object.assign(__ds_scope, { TimeWindow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/TimeWindow.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ConnectionBanner.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-connbanner", `
@keyframes mcn-conn-spin { to { transform: rotate(360deg) } }
.mcn-connbanner{display:flex;align-items:center;gap:var(--mecanu-space-2);padding:var(--mecanu-space-2) var(--mecanu-space-4);font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-caption);line-height:var(--mecanu-line-height-caption);font-weight:700}
.mcn-connbanner .spin{width:14px;height:14px;border-radius:999px;border:2px solid rgba(0,0,0,.2);border-top-color:currentColor;animation:mcn-conn-spin .9s linear infinite;flex:none}
`);
const S = {
  offline: {
    bg: "#FDEBDD",
    fg: "#9C420B",
    icon: "wifi_off",
    text: n => n ? n + " cambio(s) en cola — se enviarán al recuperar señal" : "Sin conexión — tus cambios se guardan y se enviarán solos"
  },
  syncing: {
    bg: "var(--mecanu-electric-100)",
    fg: "var(--mecanu-emerald-800)",
    icon: null,
    text: () => "Sincronizando cambios…"
  },
  synced: {
    bg: "var(--mecanu-electric-100)",
    fg: "var(--mecanu-emerald-800)",
    icon: "cloud_done",
    text: () => "Todo sincronizado"
  }
};
function ConnectionBanner({
  status = "offline",
  queuedCount = 0,
  style
}) {
  const s = S[status] || S.offline;
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-connbanner",
    role: "status",
    style: {
      background: s.bg,
      color: s.fg,
      ...style
    }
  }, status === "syncing" ? /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.icon,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", null, s.text(queuedCount)));
}
Object.assign(__ds_scope, { ConnectionBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ConnectionBanner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ErrorState.jsx
try { (() => {
const VARIANTS = {
  empty: {
    icon: "inbox",
    tint: "var(--mecanu-text-disabled-light)",
    title: "Sin resultados"
  },
  error: {
    icon: "error",
    tint: "var(--mecanu-alert)",
    title: "No se pudo cargar"
  },
  offline: {
    icon: "wifi_off",
    tint: "var(--mecanu-warning)",
    title: "Sin conexión"
  },
  permission: {
    icon: "lock",
    tint: "var(--mecanu-warning)",
    title: "Permiso necesario"
  }
};
function ErrorState({
  variant = "error",
  title,
  message,
  actionLabel,
  onAction,
  compact = false,
  style
}) {
  const v = VARIANTS[variant] || VARIANTS.error;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "var(--mecanu-space-3)",
      padding: compact ? "var(--mecanu-space-6)" : "var(--mecanu-space-10) var(--mecanu-space-6)",
      fontFamily: "var(--mecanu-font-family)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: v.icon,
    size: "xl",
    color: v.tint
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--mecanu-font-size-h4)",
      lineHeight: "var(--mecanu-line-height-h4)",
      fontWeight: 700,
      color: "var(--mecanu-text-primary-light)"
    }
  }, title || v.title), message ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--mecanu-font-size-caption)",
      lineHeight: "var(--mecanu-line-height-caption)",
      color: "var(--mecanu-text-secondary-light)",
      marginTop: 4,
      maxWidth: 320
    }
  }, message) : null), onAction ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    kind: "secondary",
    size: "compact",
    icon: variant === "offline" || variant === "error" ? "refresh" : undefined,
    onClick: onAction
  }, actionLabel || "Reintentar") : null);
}
Object.assign(__ds_scope, { ErrorState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ErrorState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
const {
  useEffect
} = React;
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-modal", `
@keyframes mcn-modal-in { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes mcn-overlay-in { from { opacity: 0 } to { opacity: 1 } }
.mcn-overlay{position:fixed;inset:0;background:rgba(22,23,24,.5);display:flex;align-items:center;justify-content:center;z-index:100;animation:mcn-overlay-in 200ms var(--mecanu-ease-linear)}
.mcn-modal{background:var(--mecanu-neutral-0);border-radius:var(--mecanu-radius-300);box-shadow:var(--mecanu-shadow-shallow-up);width:min(520px, calc(100vw - 32px));max-height:calc(100vh - 64px);display:flex;flex-direction:column;font-family:var(--mecanu-font-family);animation:mcn-modal-in 500ms var(--mecanu-ease-decelerate)}
.mcn-modal-x{border:none;background:none;cursor:pointer;padding:8px;border-radius:var(--mecanu-radius-100);display:inline-flex;color:var(--mecanu-text-secondary-light)}
.mcn-modal-x:hover{background:var(--mecanu-bg-secondary-light);color:var(--mecanu-text-primary-light)}
`);
function Modal({
  open,
  title,
  children,
  onClose,
  primaryAction,
  onPrimary,
  secondaryAction = "Cancelar",
  style
}) {
  useEffect(() => {
    if (!open) return;
    const esc = e => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-overlay",
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mcn-modal",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "var(--mecanu-space-4) var(--mecanu-space-6)",
      borderBottom: "1px solid var(--mecanu-border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--mecanu-font-size-h3)",
      lineHeight: "var(--mecanu-line-height-h3)",
      fontWeight: 700
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "mcn-modal-x",
    "aria-label": "Cerrar",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "close",
    size: "md"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--mecanu-space-4) var(--mecanu-space-6)",
      overflow: "auto",
      flex: 1
    }
  }, children), primaryAction ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--mecanu-space-2)",
      padding: "var(--mecanu-space-4) var(--mecanu-space-6)",
      borderTop: "1px solid var(--mecanu-border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    kind: "tertiary",
    onClick: onClose
  }, secondaryAction), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: onPrimary
  }, primaryAction)) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusBanner.jsx
try { (() => {
function StatusBanner({
  icon = "shield",
  kind = "dark",
  children,
  action,
  onAction,
  style
}) {
  const bg = kind === "dark" ? "var(--mecanu-bg-secondary-dark)" : kind === "warning" ? "#FDEBDD" : kind === "alert" ? "#FCE0E2" : "var(--mecanu-electric-100)";
  const fg = kind === "dark" ? "var(--mecanu-text-primary-dark)" : kind === "warning" ? "#9C420B" : kind === "alert" ? "#A81823" : "var(--mecanu-emerald-800)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--mecanu-space-2)",
      background: bg,
      color: fg,
      padding: "var(--mecanu-space-2) var(--mecanu-space-4)",
      fontFamily: "var(--mecanu-font-family)",
      fontSize: "var(--mecanu-font-size-h5)",
      lineHeight: "var(--mecanu-line-height-h5)",
      fontWeight: 700,
      ...style
    },
    role: "status"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), action ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    style: {
      border: "none",
      background: "none",
      color: "inherit",
      fontFamily: "inherit",
      fontSize: "inherit",
      fontWeight: 800,
      textDecoration: "underline",
      cursor: "pointer",
      padding: 0
    }
  }, action) : null);
}
Object.assign(__ds_scope, { StatusBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusBanner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-toast", `
@keyframes mcn-toast-in { from { transform: translateY(16px); opacity: 0 } to { transform: none; opacity: 1 } }
.mcn-toast{display:flex;align-items:flex-start;gap:var(--mecanu-space-3);background:var(--mecanu-neutral-900);color:var(--mecanu-neutral-0);border-radius:var(--mecanu-radius-200);box-shadow:var(--mecanu-shadow-deep);padding:var(--mecanu-space-3) var(--mecanu-space-4);font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-h5);line-height:var(--mecanu-line-height-h5);max-width:420px;animation:mcn-toast-in 500ms var(--mecanu-ease-decelerate)}
.mcn-toast button{border:none;background:none;color:var(--mecanu-neutral-200);cursor:pointer;padding:0;display:inline-flex;margin-left:auto}
.mcn-toast button:hover{color:var(--mecanu-neutral-0)}
`);
const TOAST_ICONS = {
  info: "info",
  positive: "check_circle",
  warning: "warning",
  alert: "error"
};
const TOAST_COLORS = {
  info: "var(--mecanu-info)",
  positive: "var(--mecanu-positive)",
  warning: "var(--mecanu-warning)",
  alert: "var(--mecanu-alert)"
};
function Toast({
  kind = "info",
  children,
  onDismiss,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-toast",
    role: "status",
    style: style
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: TOAST_ICONS[kind],
    size: "md",
    color: TOAST_COLORS[kind],
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Cerrar",
    onClick: onDismiss
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "close",
    size: "sm"
  })) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/UpsellAlertCard.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-upsell", `
@keyframes mcn-upsell-in { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
.mcn-upsell{display:flex;gap:var(--mecanu-space-3);align-items:flex-start;background:var(--mecanu-neutral-0);border:1px solid var(--mecanu-border);border-left:none;border-radius:var(--mecanu-radius-300);box-shadow:var(--mecanu-shadow-deep);padding:var(--mecanu-space-4);font-family:var(--mecanu-font-family);max-width:420px;animation:mcn-upsell-in 500ms var(--mecanu-ease-decelerate);position:relative;overflow:hidden}
.mcn-upsell::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:var(--mecanu-warning)}
@keyframes mcn-upsell-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
.mcn-upsell.is-new .mcn-upsell-dot{animation:mcn-upsell-pulse 1.6s var(--mecanu-ease-linear) infinite}
`);
function UpsellAlertCard({
  title,
  detail,
  thumbnailSrc,
  isNew = false,
  cta = "Ver cotización",
  onCta,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-upsell" + (isNew ? " is-new" : ""),
    style: style
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "warning",
    size: "lg",
    color: "var(--mecanu-warning)"
  }), thumbnailSrc ? /*#__PURE__*/React.createElement("img", {
    src: thumbnailSrc,
    alt: "",
    style: {
      width: 56,
      height: 56,
      borderRadius: "var(--mecanu-radius-200)",
      objectFit: "cover",
      flex: "none"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 6,
      fontWeight: 700,
      fontSize: "var(--mecanu-font-size-h5)",
      lineHeight: "var(--mecanu-line-height-h5)"
    }
  }, isNew ? /*#__PURE__*/React.createElement("span", {
    className: "mcn-upsell-dot",
    style: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "var(--mecanu-warning)",
      flex: "none",
      marginTop: 6
    }
  }) : null, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--mecanu-font-size-caption)",
      lineHeight: "var(--mecanu-line-height-caption)",
      color: "var(--mecanu-text-secondary-light)",
      margin: "2px 0 10px"
    }
  }, detail), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "compact",
    kind: "secondary",
    onClick: onCta
  }, cta)));
}
Object.assign(__ds_scope, { UpsellAlertCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/UpsellAlertCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Attachment.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-attach", `
@keyframes mcn-spin2 { to { transform: rotate(360deg) } }
.mcn-attach{display:flex;align-items:center;gap:var(--mecanu-space-3);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-200);background:var(--mecanu-neutral-0);padding:var(--mecanu-space-3) var(--mecanu-space-4);font-family:var(--mecanu-font-family)}
.mcn-attach.is-error{border-color:var(--mecanu-alert)}
.mcn-attach .x{border:none;background:none;cursor:pointer;padding:6px;border-radius:var(--mecanu-radius-100);display:inline-flex;color:var(--mecanu-text-secondary-light)}
.mcn-attach .x:hover{background:var(--mecanu-bg-secondary-light);color:var(--mecanu-text-primary-light)}
.mcn-attach .spin{width:20px;height:20px;border-radius:999px;border:2.5px solid var(--mecanu-neutral-25);border-top-color:var(--mecanu-brand-primary-light);animation:mcn-spin2 .9s linear infinite;flex:none}
`);
const A_ICONS = {
  image: "image",
  pdf: "picture_as_pdf",
  doc: "description"
};
function Attachment({
  name,
  meta,
  type = "doc",
  status = "done",
  progress,
  onRemove,
  onRetry,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-attach" + (status === "error" ? " is-error" : ""),
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: "var(--mecanu-radius-100)",
      background: "var(--mecanu-bg-secondary-light)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: A_ICONS[type] || type,
    size: "md",
    color: "var(--mecanu-text-secondary-light)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--mecanu-font-size-h5)",
      lineHeight: "var(--mecanu-line-height-h5)",
      fontWeight: 700,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--mecanu-font-size-caption)",
      lineHeight: "var(--mecanu-line-height-caption)",
      color: status === "error" ? "var(--mecanu-alert)" : "var(--mecanu-text-secondary-light)"
    }
  }, status === "uploading" ? "Subiendo… " + (progress != null ? progress + "%" : "") : status === "error" ? "Falló la subida" : meta), status === "uploading" ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      height: 4,
      borderRadius: 999,
      background: "var(--mecanu-bg-tertiary-light)",
      marginTop: 6,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      height: "100%",
      width: (progress || 0) + "%",
      background: "var(--mecanu-brand-primary-light)",
      borderRadius: 999,
      transition: "width 200ms var(--mecanu-ease-linear)"
    }
  })) : null), status === "uploading" ? /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }) : null, status === "done" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check_circle",
    size: "md",
    filled: true,
    color: "var(--mecanu-positive)"
  }) : null, status === "error" && onRetry ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "x",
    "aria-label": "Reintentar",
    onClick: onRetry
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "replay",
    size: "md"
  })) : null, onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "x",
    "aria-label": "Quitar",
    onClick: onRemove
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "close",
    size: "sm"
  })) : null);
}
Object.assign(__ds_scope, { Attachment });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Attachment.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-check", `
.mcn-check{display:inline-flex;align-items:center;gap:var(--mecanu-space-2);cursor:pointer;font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-body);user-select:none}
.mcn-check input{position:absolute;opacity:0;width:0}
.mcn-check .box{width:20px;height:20px;border:2px solid var(--mecanu-neutral-300);border-radius:var(--mecanu-radius-100);display:inline-flex;align-items:center;justify-content:center;background:var(--mecanu-neutral-0);transition:background-color 200ms var(--mecanu-ease-linear),border-color 200ms var(--mecanu-ease-linear);flex:none}
.mcn-check input:checked + .box{background:var(--mecanu-brand-primary-dark);border-color:var(--mecanu-brand-primary-dark)}
.mcn-check input:checked + .box::after{content:"";width:10px;height:6px;border-left:2.5px solid var(--mecanu-neutral-900);border-bottom:2.5px solid var(--mecanu-neutral-900);transform:rotate(-45deg) translate(1px,-1px)}
.mcn-check input:focus-visible + .box{outline:2px solid var(--mecanu-brand-primary-light);outline-offset:2px}
.mcn-check.is-disabled{color:var(--mecanu-text-disabled-light);cursor:not-allowed}
`);
function Checkbox({
  checked,
  onChange,
  children,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "mcn-check" + (disabled ? " is-disabled" : ""),
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "box"
  }), children ? /*#__PURE__*/React.createElement("span", null, children) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/DateRangePicker.jsx
try { (() => {
const {
  useState
} = React;
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-dtp", `
.mcn-dtp{background:var(--mecanu-neutral-0);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-300);box-shadow:var(--mecanu-shadow-shallow-down);padding:var(--mecanu-space-4);width:300px;font-family:var(--mecanu-font-family);user-select:none}
.mcn-dtp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--mecanu-space-3)}
.mcn-dtp-head button{border:none;background:none;cursor:pointer;padding:6px;border-radius:var(--mecanu-radius-100);display:inline-flex;color:var(--mecanu-text-primary-light)}
.mcn-dtp-head button:hover{background:var(--mecanu-bg-secondary-light)}
.mcn-dtp-grid{display:grid;grid-template-columns:repeat(7,1fr)}
.mcn-dtp-dow{font-size:var(--mecanu-font-size-caption);color:var(--mecanu-text-disabled-light);text-align:center;padding:4px 0}
.mcn-dtp-day{border:none;background:none;cursor:pointer;font-family:inherit;font-size:var(--mecanu-font-size-h5);color:var(--mecanu-text-primary-light);height:34px;border-radius:var(--mecanu-radius-100);position:relative}
.mcn-dtp-day:hover:not(:disabled){background:var(--mecanu-bg-secondary-light)}
.mcn-dtp-day:disabled{color:var(--mecanu-text-disabled-light);cursor:default}
.mcn-dtp-day.in-range{background:var(--mecanu-electric-100);border-radius:0}
.mcn-dtp-day.is-edge{background:var(--mecanu-brand-primary-dark);color:var(--mecanu-text-primary-light);font-weight:700;border-radius:var(--mecanu-radius-100)}
.mcn-dtp-time{margin-top:var(--mecanu-space-3);padding-top:var(--mecanu-space-3);border-top:1px solid var(--mecanu-border-subtle);display:flex;flex-direction:column;gap:var(--mecanu-space-2)}
.mcn-dtp-time label{font-size:var(--mecanu-font-size-h5);font-weight:700}
.mcn-dtp-time .t{display:flex;align-items:center;gap:var(--mecanu-space-2);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-100);padding:0 var(--mecanu-space-3);height:40px}
.mcn-dtp-time input{border:none;outline:none;font-family:inherit;font-size:var(--mecanu-font-size-h5);color:var(--mecanu-text-primary-light);width:100%}
`);
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DOW = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
function DateRangePicker({
  month = 6,
  year = 2026,
  range,
  onChange,
  showTime = true,
  startTime = "10:30",
  endTime = "12:30",
  onTimeChange,
  style
}) {
  const [m, setM] = useState(month),
    [y, setY] = useState(year);
  const [r, setR] = useState(range || {
    start: null,
    end: null
  });
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const pick = d => {
    let next;
    if (!r.start || r.start && r.end) next = {
      start: d,
      end: null
    };else next = d >= r.start ? {
      start: r.start,
      end: d
    } : {
      start: d,
      end: r.start
    };
    setR(next);
    onChange && onChange(next);
  };
  const prev = () => {
    m === 0 ? (setM(11), setY(y - 1)) : setM(m - 1);
  };
  const nxt = () => {
    m === 11 ? (setM(0), setY(y + 1)) : setM(m + 1);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-dtp",
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "mcn-dtp-head"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Mes anterior",
    onClick: prev
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron_left",
    size: "md"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: "var(--mecanu-font-size-h5)"
    }
  }, MESES[m], " de ", y), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Mes siguiente",
    onClick: nxt
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron_right",
    size: "md"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mcn-dtp-grid"
  }, DOW.map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    className: "mcn-dtp-dow"
  }, d)), Array.from({
    length: first
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: "e" + i
  })), Array.from({
    length: days
  }).map((_, i) => {
    const d = i + 1;
    const edge = d === r.start || d === r.end;
    const inR = r.start && r.end && d > r.start && d < r.end;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      type: "button",
      className: "mcn-dtp-day" + (edge ? " is-edge" : "") + (inR ? " in-range" : ""),
      onClick: () => pick(d)
    }, d);
  })), showTime ? /*#__PURE__*/React.createElement("div", {
    className: "mcn-dtp-time"
  }, /*#__PURE__*/React.createElement("label", null, "Hora de inicio"), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "schedule",
    size: "sm",
    color: "var(--mecanu-text-secondary-light)"
  }), /*#__PURE__*/React.createElement("input", {
    type: "time",
    defaultValue: startTime,
    onChange: e => onTimeChange && onTimeChange("start", e.target.value)
  })), /*#__PURE__*/React.createElement("label", null, "Hora de fin"), /*#__PURE__*/React.createElement("span", {
    className: "t"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "schedule",
    size: "sm",
    color: "var(--mecanu-text-secondary-light)"
  }), /*#__PURE__*/React.createElement("input", {
    type: "time",
    defaultValue: endTime,
    onChange: e => onTimeChange && onTimeChange("end", e.target.value)
  }))) : null);
}
Object.assign(__ds_scope, { DateRangePicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/DateRangePicker.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-input", `
.mcn-input-wrap{display:inline-flex;align-items:center;gap:var(--mecanu-space-2);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-100);background:var(--mecanu-neutral-0);padding:0 var(--mecanu-space-3);height:48px;transition:border-color 200ms var(--mecanu-ease-linear)}
.mcn-input-wrap:focus-within{border-color:var(--mecanu-brand-primary-light);outline:1px solid var(--mecanu-brand-primary-light)}
.mcn-input-wrap.is-error{border-color:var(--mecanu-alert)}
.mcn-input-wrap.is-disabled{background:var(--mecanu-bg-secondary-light)}
.mcn-input-wrap input{border:none;outline:none;background:transparent;font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-body);color:var(--mecanu-text-primary-light);width:100%;min-width:0}
.mcn-input-wrap input::placeholder{color:var(--mecanu-text-disabled-light)}
.mcn-field-label{display:block;font-size:var(--mecanu-font-size-h5);line-height:var(--mecanu-line-height-h5);font-weight:var(--mecanu-font-weight-bold);margin-bottom:var(--mecanu-space-1)}
.mcn-field-caption{display:block;font-size:var(--mecanu-font-size-caption);line-height:var(--mecanu-line-height-caption);color:var(--mecanu-text-secondary-light);margin-top:var(--mecanu-space-1)}
.mcn-field-caption.is-error{color:var(--mecanu-alert)}
`);
function Input({
  label,
  caption,
  error,
  icon,
  disabled,
  fullWidth,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: fullWidth ? "block" : "inline-block",
      width: fullWidth ? "100%" : undefined,
      fontFamily: "var(--mecanu-font-family)",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "mcn-field-label"
  }, label) : null, /*#__PURE__*/React.createElement("span", {
    className: "mcn-input-wrap" + (error ? " is-error" : "") + (disabled ? " is-disabled" : ""),
    style: {
      width: fullWidth ? "100%" : undefined
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: "sm",
    color: "var(--mecanu-text-secondary-light)"
  }) : null, /*#__PURE__*/React.createElement("input", _extends({
    disabled: disabled
  }, rest))), caption || error ? /*#__PURE__*/React.createElement("span", {
    className: "mcn-field-caption" + (error ? " is-error" : "")
  }, error || caption) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-radio", `
.mcn-radio{display:inline-flex;align-items:center;gap:var(--mecanu-space-2);cursor:pointer;font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-body);user-select:none}
.mcn-radio input{position:absolute;opacity:0;width:0}
.mcn-radio .dot{width:20px;height:20px;border:2px solid var(--mecanu-neutral-300);border-radius:var(--mecanu-radius-full);display:inline-flex;align-items:center;justify-content:center;background:var(--mecanu-neutral-0);transition:border-color 200ms var(--mecanu-ease-linear);flex:none}
.mcn-radio input:checked + .dot{border-color:var(--mecanu-brand-primary-light)}
.mcn-radio input:checked + .dot::after{content:"";width:10px;height:10px;border-radius:999px;background:var(--mecanu-brand-primary-light)}
.mcn-radio input:focus-visible + .dot{outline:2px solid var(--mecanu-brand-primary-light);outline-offset:2px}
.mcn-radio.is-disabled{color:var(--mecanu-text-disabled-light);cursor:not-allowed}
`);
function Radio({
  checked,
  onChange,
  name,
  value,
  children,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "mcn-radio" + (disabled ? " is-disabled" : ""),
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: () => onChange && onChange(value)
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), children ? /*#__PURE__*/React.createElement("span", null, children) : null);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React;
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-select", `
.mcn-select{position:relative;display:inline-block;font-family:var(--mecanu-font-family)}
.mcn-select-btn{display:flex;align-items:center;justify-content:space-between;gap:var(--mecanu-space-2);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-100);background:var(--mecanu-neutral-0);padding:0 var(--mecanu-space-3);height:48px;min-width:180px;cursor:pointer;font-family:inherit;font-size:var(--mecanu-font-size-body);color:var(--mecanu-text-primary-light);width:100%}
.mcn-select-btn:focus-visible,.mcn-select.is-open .mcn-select-btn{border-color:var(--mecanu-brand-primary-light);outline:1px solid var(--mecanu-brand-primary-light)}
.mcn-select-menu{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--mecanu-neutral-0);border-radius:var(--mecanu-radius-100);box-shadow:var(--mecanu-shadow-shallow-down);border:1px solid var(--mecanu-border-subtle);z-index:30;max-height:280px;overflow:auto;padding:var(--mecanu-space-1) 0}
.mcn-select-group{font-size:var(--mecanu-font-size-label);line-height:var(--mecanu-line-height-label);font-weight:var(--mecanu-font-weight-black);text-transform:uppercase;letter-spacing:.04em;color:var(--mecanu-text-secondary-light);padding:var(--mecanu-space-2) var(--mecanu-space-3) var(--mecanu-space-1)}
.mcn-select-opt{display:flex;align-items:center;justify-content:space-between;gap:var(--mecanu-space-2);padding:var(--mecanu-space-2) var(--mecanu-space-3);cursor:pointer;font-size:var(--mecanu-font-size-body)}
.mcn-select-opt:hover{background:var(--mecanu-bg-secondary-light)}
.mcn-select-opt.is-selected{font-weight:var(--mecanu-font-weight-bold)}
`);
function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Seleccionar…",
  fullWidth,
  style
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const flat = options.flatMap(o => o.options ? o.options : [o]);
  const sel = flat.find(o => o.value === value);
  const renderOpt = o => /*#__PURE__*/React.createElement("div", {
    key: o.value,
    className: "mcn-select-opt" + (o.value === value ? " is-selected" : ""),
    onClick: () => {
      onChange && onChange(o.value);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", null, o.label), o.value === value ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: "sm",
    color: "var(--mecanu-brand-primary-light)"
  }) : null);
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-select" + (open ? " is-open" : ""),
    ref: ref,
    style: {
      width: fullWidth ? "100%" : undefined,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "mcn-field-label",
    style: {
      display: "block",
      fontSize: 14,
      lineHeight: "20px",
      fontWeight: 700,
      marginBottom: 4
    }
  }, label) : null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "mcn-select-btn",
    onClick: () => setOpen(!open)
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: sel ? undefined : "var(--mecanu-text-disabled-light)"
    }
  }, sel ? sel.label : placeholder), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: open ? "keyboard_arrow_up" : "keyboard_arrow_down",
    size: "md",
    color: "var(--mecanu-text-secondary-light)"
  })), open ? /*#__PURE__*/React.createElement("div", {
    className: "mcn-select-menu"
  }, options.map((o, i) => o.options ? /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "mcn-select-group"
  }, o.label), o.options.map(renderOpt)) : renderOpt(o))) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-switch", `
.mcn-switch{display:inline-flex;align-items:center;gap:var(--mecanu-space-3);cursor:pointer;font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-body);user-select:none;min-height:var(--mecanu-touch-target-min)}
.mcn-switch input{position:absolute;opacity:0;width:0}
.mcn-switch .track{width:52px;height:32px;border-radius:var(--mecanu-radius-full);background:var(--mecanu-neutral-200);position:relative;transition:background-color 200ms var(--mecanu-ease-linear);flex:none}
.mcn-switch .track::after{content:"";position:absolute;top:4px;left:4px;width:24px;height:24px;border-radius:999px;background:var(--mecanu-neutral-0);box-shadow:var(--mecanu-shadow-shallow-down);transition:transform 200ms var(--mecanu-ease-linear)}
.mcn-switch input:checked + .track{background:var(--mecanu-brand-primary-light)}
.mcn-switch input:checked + .track::after{transform:translateX(20px)}
.mcn-switch input:focus-visible + .track{outline:2px solid var(--mecanu-brand-primary-light);outline-offset:2px}
.mcn-switch.is-disabled{color:var(--mecanu-text-disabled-light);cursor:not-allowed}
`);
function Switch({
  checked,
  onChange,
  children,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "mcn-switch" + (disabled ? " is-disabled" : ""),
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "track"
  }), children ? /*#__PURE__*/React.createElement("span", null, children) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/mobile/BottomSheet.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-sheet", `
@keyframes mcn-sheet-in { from { transform: translateY(100%) } to { transform: none } }
.mcn-sheet{position:absolute;left:0;right:0;bottom:0;background:var(--mecanu-neutral-0);border-radius:var(--mecanu-radius-400) var(--mecanu-radius-400) 0 0;box-shadow:var(--mecanu-shadow-shallow-up);font-family:var(--mecanu-font-family);animation:mcn-sheet-in 500ms var(--mecanu-ease-decelerate);z-index:50}
.mcn-sheet .handle{width:40px;height:4px;border-radius:999px;background:var(--mecanu-neutral-200);margin:var(--mecanu-space-2) auto var(--mecanu-space-1)}
`);
function BottomSheet({
  open = true,
  title,
  children,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-sheet",
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "handle"
  }), title ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--mecanu-space-2) var(--mecanu-space-4) 0",
      fontWeight: 700,
      fontSize: "var(--mecanu-font-size-h4)",
      lineHeight: "var(--mecanu-line-height-h4)"
    }
  }, title) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--mecanu-space-3) var(--mecanu-space-4) var(--mecanu-space-4)"
    }
  }, children));
}
Object.assign(__ds_scope, { BottomSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/BottomSheet.jsx", error: String((e && e.message) || e) }); }

// components/mobile/CameraTrigger.jsx
try { (() => {
function CameraTrigger({
  size = 72,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Tomar foto",
    onClick: onClick,
    style: {
      width: size,
      height: size,
      borderRadius: 999,
      border: "4px solid var(--mecanu-neutral-0)",
      background: "var(--mecanu-brand-primary-dark)",
      color: "var(--mecanu-text-primary-light)",
      boxShadow: "var(--mecanu-shadow-deep)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "photo_camera",
    size: "xl"
  }));
}
Object.assign(__ds_scope, { CameraTrigger });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/CameraTrigger.jsx", error: String((e && e.message) || e) }); }

// components/mobile/EvidenceGrid.jsx
try { (() => {
const STATUS = {
  approved: {
    border: "var(--mecanu-positive)",
    icon: "check_circle",
    color: "var(--mecanu-positive)"
  },
  retry: {
    border: "var(--mecanu-alert)",
    icon: "replay",
    color: "var(--mecanu-alert)"
  },
  empty: {
    border: "var(--mecanu-border)",
    icon: "photo_camera",
    color: "var(--mecanu-text-disabled-light)"
  }
};
function EvidenceGrid({
  slots = [],
  columns = 2,
  onSlotClick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(" + columns + ", 1fr)",
      gap: "var(--mecanu-space-3)",
      fontFamily: "var(--mecanu-font-family)",
      ...style
    }
  }, slots.map((s, i) => {
    const st = STATUS[s.status || "empty"];
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      onClick: () => onSlotClick && onSlotClick(s, i),
      style: {
        position: "relative",
        aspectRatio: "4/3",
        borderRadius: "var(--mecanu-radius-200)",
        border: "2px solid " + st.border,
        background: s.src ? "none" : "var(--mecanu-bg-secondary-light)",
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "var(--mecanu-touch-target-min)"
      }
    }, s.src ? /*#__PURE__*/React.createElement("img", {
      src: s.src,
      alt: s.label,
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }
    }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "photo_camera",
      size: "xl",
      color: "var(--mecanu-text-disabled-light)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 8,
        bottom: 8,
        background: "rgba(22,23,24,.72)",
        color: "var(--mecanu-neutral-0)",
        fontSize: "var(--mecanu-font-size-caption)",
        lineHeight: "var(--mecanu-line-height-caption)",
        fontWeight: 700,
        borderRadius: "var(--mecanu-radius-100)",
        padding: "2px 8px"
      }
    }, s.label), s.status && s.status !== "empty" ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 8,
        right: 8,
        display: "inline-flex",
        background: "var(--mecanu-neutral-0)",
        borderRadius: 999
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: st.icon,
      size: "md",
      filled: true,
      color: st.color
    })) : null);
  }));
}
Object.assign(__ds_scope, { EvidenceGrid });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/EvidenceGrid.jsx", error: String((e && e.message) || e) }); }

// components/mobile/IncidentButton.jsx
try { (() => {
const {
  useRef,
  useState
} = React;
function IncidentButton({
  label = "Reportar siniestro",
  holdMs = 1200,
  onActivate,
  style
}) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const timer = useRef(null);
  const start = () => {
    if (active) return;
    const t0 = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / holdMs);
      setProgress(p);
      if (p >= 1) {
        clearInterval(timer.current);
        setActive(true);
        onActivate && onActivate();
      }
    }, 30);
  };
  const cancel = () => {
    clearInterval(timer.current);
    if (!active) setProgress(0);
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    style: {
      position: "relative",
      overflow: "hidden",
      width: "100%",
      minHeight: 56,
      border: "none",
      borderRadius: "var(--mecanu-radius-300)",
      background: active ? "#A81823" : "var(--mecanu-alert)",
      color: "var(--mecanu-neutral-0)",
      fontFamily: "var(--mecanu-font-family)",
      fontWeight: 700,
      fontSize: 16,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--mecanu-space-2)",
      userSelect: "none",
      touchAction: "none",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(22,23,24,.25)",
      transformOrigin: "left",
      transform: "scaleX(" + progress + ")",
      transition: progress === 0 ? "transform 200ms var(--mecanu-ease-responsive-accelerate)" : "none"
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: active ? "shield" : "warning",
    size: "md",
    filled: active,
    style: {
      position: "relative"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative"
    }
  }, active ? "Viaje congelado — seguro activo" : label));
}
Object.assign(__ds_scope, { IncidentButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/IncidentButton.jsx", error: String((e && e.message) || e) }); }

// components/mobile/OversizedButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function OversizedButton({
  anchored = false,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Button, _extends({
    size: "large",
    fullWidth: true
  }, rest, {
    style: {
      minHeight: 56,
      borderRadius: anchored ? "var(--mecanu-radius-300) var(--mecanu-radius-300) 0 0" : "var(--mecanu-radius-300)",
      fontSize: 16,
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { OversizedButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/OversizedButton.jsx", error: String((e && e.message) || e) }); }

// components/mobile/QuickCallButton.jsx
try { (() => {
function QuickCallButton({
  context = "cliente",
  onClick,
  fixed = false,
  style
}) {
  const alert = context === "taller";
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Llamar a " + context,
    onClick: onClick,
    style: {
      position: fixed ? "fixed" : "relative",
      right: fixed ? 16 : undefined,
      bottom: fixed ? 16 : undefined,
      width: 56,
      height: 56,
      borderRadius: 999,
      border: "none",
      background: alert ? "var(--mecanu-alert)" : "var(--mecanu-brand-primary-dark)",
      color: alert ? "var(--mecanu-neutral-0)" : "var(--mecanu-text-primary-light)",
      boxShadow: "var(--mecanu-shadow-deep)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 40,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "call",
    size: "lg"
  }));
}
Object.assign(__ds_scope, { QuickCallButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/QuickCallButton.jsx", error: String((e && e.message) || e) }); }

// components/mobile/SignatureCanvas.jsx
try { (() => {
const {
  useRef,
  useEffect,
  useState
} = React;
function SignatureCanvas({
  height = 180,
  onChange,
  style
}) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);
  useEffect(() => {
    const c = canvasRef.current;
    const scale = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * scale;
    c.height = c.offsetHeight * scale;
    const ctx = c.getContext("2d");
    ctx.scale(scale, scale);
    ctx.strokeStyle = "#161718";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);
  const pos = e => {
    const r = canvasRef.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const start = e => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(...pos(e));
    e.target.setPointerCapture(e.pointerId);
  };
  const move = e => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(...pos(e));
    ctx.stroke();
    if (empty) {
      setEmpty(false);
      onChange && onChange(false);
    }
  };
  const end = () => {
    drawing.current = false;
  };
  const clear = () => {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    onChange && onChange(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--mecanu-font-family)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
    style: {
      width: "100%",
      height,
      background: "var(--mecanu-neutral-0)",
      border: "1px solid var(--mecanu-border)",
      borderRadius: "var(--mecanu-radius-200)",
      touchAction: "none",
      display: "block"
    }
  }), empty ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--mecanu-text-disabled-light)",
      fontSize: "var(--mecanu-font-size-h5)",
      pointerEvents: "none"
    }
  }, "Firma aqu\xED") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--mecanu-space-2)",
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    kind: "tertiary",
    size: "compact",
    icon: "replay",
    onClick: clear,
    disabled: empty
  }, "Borrar y repetir")));
}
Object.assign(__ds_scope, { SignatureCanvas });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/SignatureCanvas.jsx", error: String((e && e.message) || e) }); }

// components/mobile/SlideToConfirm.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useRef,
  useState
} = React;
function SlideToConfirm({
  label = "Desliza para confirmar",
  confirmedLabel = "Confirmado",
  onConfirm,
  style
}) {
  const trackRef = useRef(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);
  const THUMB = 56,
    PAD = 4;
  const max = () => trackRef.current ? trackRef.current.offsetWidth - THUMB - PAD * 2 : 200;
  const move = clientX => {
    if (done) return;
    const rect = trackRef.current.getBoundingClientRect();
    setX(Math.min(max(), Math.max(0, clientX - rect.left - THUMB / 2 - PAD)));
  };
  const end = () => {
    if (done) return;
    setDrag(false);
    if (x >= max() * 0.92) {
      setX(max());
      setDone(true);
      onConfirm && onConfirm();
    } else setX(0);
  };
  const handlers = {
    onPointerDown: e => {
      setDrag(true);
      e.target.setPointerCapture(e.pointerId);
    },
    onPointerMove: e => drag && move(e.clientX),
    onPointerUp: end,
    onPointerCancel: end
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    style: {
      position: "relative",
      height: 64,
      borderRadius: "var(--mecanu-radius-full)",
      background: done ? "var(--mecanu-electric-100)" : "var(--mecanu-bg-tertiary-light)",
      fontFamily: "var(--mecanu-font-family)",
      userSelect: "none",
      touchAction: "none",
      overflow: "hidden",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: "var(--mecanu-font-size-body)",
      color: done ? "var(--mecanu-emerald-800)" : "var(--mecanu-text-secondary-light)",
      opacity: done ? 1 : 1 - x / 150,
      transition: drag ? "none" : "opacity 200ms var(--mecanu-ease-linear)"
    }
  }, done ? confirmedLabel : label), /*#__PURE__*/React.createElement("span", _extends({}, handlers, {
    style: {
      position: "absolute",
      top: 4,
      left: 4,
      width: 56,
      height: 56,
      borderRadius: 999,
      background: "var(--mecanu-brand-primary-dark)",
      color: "var(--mecanu-text-primary-light)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: done ? "default" : "grab",
      transform: "translateX(" + x + "px)",
      transition: drag ? "none" : "transform 500ms var(--mecanu-ease-decelerate)",
      boxShadow: "var(--mecanu-shadow-shallow-down)"
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: done ? "check" : "arrow_forward",
    size: "lg"
  })));
}
Object.assign(__ds_scope, { SlideToConfirm });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/SlideToConfirm.jsx", error: String((e && e.message) || e) }); }

// components/mobile/TireSelector.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-tire", `
.mcn-tire{display:flex;gap:0;border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-200);overflow:hidden;font-family:var(--mecanu-font-family)}
.mcn-tire button{flex:1;border:none;background:var(--mecanu-neutral-0);font-family:inherit;font-size:var(--mecanu-font-size-body);font-weight:500;color:var(--mecanu-text-primary-light);min-height:var(--mecanu-touch-target-min);cursor:pointer;transition:background-color 200ms var(--mecanu-ease-linear)}
.mcn-tire button + button{border-left:1px solid var(--mecanu-border)}
.mcn-tire button:hover{background:var(--mecanu-bg-secondary-light)}
.mcn-tire button.is-selected{background:var(--mecanu-brand-primary-light);color:var(--mecanu-neutral-0);font-weight:700}
`);
function TireSelector({
  options = ["Bueno", "Regular", "Vencido"],
  value,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-tire",
    role: "radiogroup",
    style: style
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    type: "button",
    role: "radio",
    "aria-checked": o === value,
    className: o === value ? "is-selected" : "",
    onClick: () => onChange && onChange(o)
  }, o)));
}
Object.assign(__ds_scope, { TireSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mobile/TireSelector.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-bottomnav", `
.mcn-bottomnav{display:flex;background:var(--mecanu-neutral-0);border-top:1px solid var(--mecanu-border-subtle);font-family:var(--mecanu-font-family)}
.mcn-bottomnav button{flex:1;border:none;background:none;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:2px;padding:var(--mecanu-space-2) 0 var(--mecanu-space-2);min-height:var(--mecanu-touch-target-min);color:var(--mecanu-text-secondary-light);font-size:var(--mecanu-font-size-caption);line-height:var(--mecanu-line-height-caption)}
.mcn-bottomnav button.is-active{color:var(--mecanu-electric-600);font-weight:700}
`);
function BottomNav({
  items = [],
  activeId,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "mcn-bottomnav",
    style: style
  }, items.map(it => {
    const active = it.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      "aria-current": active ? "page" : undefined,
      className: active ? "is-active" : "",
      onClick: () => onSelect && onSelect(it.id)
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: "lg",
      filled: active
    }), it.label);
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumbs.jsx
try { (() => {
function Breadcrumbs({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--mecanu-space-2)",
      fontFamily: "var(--mecanu-font-family)",
      fontSize: "var(--mecanu-font-size-h5)",
      lineHeight: "var(--mecanu-line-height-h5)",
      ...style
    },
    "aria-label": "Breadcrumb"
  }, items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, i > 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--mecanu-text-disabled-light)"
      }
    }, "/") : null, last ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--mecanu-text-primary-light)",
        fontWeight: 700
      },
      "aria-current": "page"
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href || "#",
      onClick: it.onClick,
      style: {
        color: "var(--mecanu-text-secondary-light)",
        textDecoration: "none"
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/FilterBar.jsx
try { (() => {
function FilterBar({
  filters = [],
  values = {},
  onChange,
  onClear,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--mecanu-space-2)",
      flexWrap: "wrap",
      fontFamily: "var(--mecanu-font-family)",
      ...style
    }
  }, filters.map(f => /*#__PURE__*/React.createElement(__ds_scope.Select, {
    key: f.id,
    placeholder: f.label,
    options: f.options,
    value: values[f.id],
    onChange: v => onChange && onChange(f.id, v),
    style: {
      minWidth: 0
    }
  })), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    kind: "tertiary",
    size: "compact",
    onClick: onClear
  }, "Limpiar filtros"));
}
Object.assign(__ds_scope, { FilterBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/FilterBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/FilterChip.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-chip", `
.mcn-chip{display:inline-flex;align-items:center;gap:var(--mecanu-space-1);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-full);background:var(--mecanu-neutral-0);font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-h5);line-height:var(--mecanu-line-height-h5);font-weight:500;color:var(--mecanu-text-primary-light);padding:6px 12px 6px 16px;cursor:pointer;transition:background-color 200ms var(--mecanu-ease-linear),border-color 200ms var(--mecanu-ease-linear);white-space:nowrap}
.mcn-chip:hover{background:var(--mecanu-bg-secondary-light)}
.mcn-chip.is-selected{border-color:var(--mecanu-neutral-900);font-weight:700}
`);
function FilterChip({
  label,
  selected = false,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "mcn-chip" + (selected ? " is-selected" : ""),
    "aria-pressed": selected,
    onClick: onClick,
    style: style
  }, label, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "keyboard_arrow_down",
    size: "sm"
  }));
}
Object.assign(__ds_scope, { FilterChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/FilterChip.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SearchInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useRef,
  useEffect
} = React;
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-search", `
.mcn-search{display:inline-flex;align-items:center;gap:var(--mecanu-space-2);border:1px solid var(--mecanu-border);border-radius:var(--mecanu-radius-100);background:var(--mecanu-neutral-0);padding:0 var(--mecanu-space-3);height:40px;transition:border-color 200ms var(--mecanu-ease-linear)}
.mcn-search:focus-within{border-color:var(--mecanu-brand-primary-light);outline:1px solid var(--mecanu-brand-primary-light)}
.mcn-search input{border:none;outline:none;background:transparent;font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-h5);color:var(--mecanu-text-primary-light);width:100%;min-width:0}
.mcn-search input::placeholder{color:var(--mecanu-text-disabled-light)}
.mcn-search kbd{font-family:var(--mecanu-font-family);font-size:var(--mecanu-font-size-body2);background:var(--mecanu-bg-secondary-light);border:1px solid var(--mecanu-border-subtle);border-radius:var(--mecanu-radius-100);padding:1px 5px;color:var(--mecanu-text-secondary-light);white-space:nowrap}
`);
function SearchInput({
  placeholder = "Buscar matrícula, conductor…",
  shortcut = true,
  fullWidth,
  style,
  ...rest
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!shortcut) return;
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        ref.current && ref.current.focus();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [shortcut]);
  return /*#__PURE__*/React.createElement("span", {
    className: "mcn-search",
    style: {
      width: fullWidth ? "100%" : 280,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: "sm",
    color: "var(--mecanu-text-secondary-light)"
  }), /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    type: "search",
    placeholder: placeholder
  }, rest)), shortcut ? /*#__PURE__*/React.createElement("kbd", null, "\u2318K") : null);
}
Object.assign(__ds_scope, { SearchInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SearchInput.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNav.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-sidenav", `
.mcn-sidenav{background:var(--mecanu-bg-primary-dark);color:var(--mecanu-text-secondary-dark);width:240px;min-height:100%;display:flex;flex-direction:column;font-family:var(--mecanu-font-family);padding:var(--mecanu-space-4) 0}
.mcn-sidenav-item{display:flex;align-items:center;gap:var(--mecanu-space-3);padding:var(--mecanu-space-3) var(--mecanu-space-4);margin:0 var(--mecanu-space-2);border-radius:var(--mecanu-radius-200);border:none;background:none;color:inherit;font-family:inherit;font-size:var(--mecanu-font-size-h5);line-height:var(--mecanu-line-height-h5);font-weight:700;cursor:pointer;text-align:left;transition:background-color 200ms var(--mecanu-ease-linear)}
.mcn-sidenav-item:hover{background:var(--mecanu-bg-tertiary-dark);color:var(--mecanu-text-primary-dark)}
.mcn-sidenav-item.is-active{background:var(--mecanu-brand-primary-dark);color:var(--mecanu-text-primary-light)}
`);
function SidebarNav({
  items = [],
  activeId,
  onSelect,
  footer,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "mcn-sidenav",
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--mecanu-space-2) var(--mecanu-space-6) var(--mecanu-space-6)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Logo, {
    variant: "light",
    height: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--mecanu-space-1)",
      flex: 1
    }
  }, items.map(it => {
    const active = it.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      className: "mcn-sidenav-item" + (active ? " is-active" : ""),
      onClick: () => onSelect && onSelect(it.id)
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: "md",
      filled: active
    }), it.label);
  })), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--mecanu-space-4) var(--mecanu-space-6) 0",
      borderTop: "1px solid var(--mecanu-neutral-800)",
      marginTop: "var(--mecanu-space-4)"
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { SidebarNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function ensureStyle(id, css) {
  if (typeof document !== 'undefined' && !document.getElementById(id)) {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }
}
ensureStyle("mcn-tabs", `
.mcn-tabs{display:flex;font-family:var(--mecanu-font-family);position:relative}
.mcn-tabs::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--mecanu-neutral-200)}
.mcn-tab{flex:1;border:none;background:none;cursor:pointer;font-family:inherit;font-size:var(--mecanu-font-size-h5);line-height:var(--mecanu-line-height-h5);font-weight:500;color:var(--mecanu-text-disabled-light);padding:var(--mecanu-space-3) var(--mecanu-space-4);position:relative;transition:color 200ms var(--mecanu-ease-linear)}
.mcn-tab:hover{color:var(--mecanu-text-secondary-light)}
.mcn-tab.is-active{color:var(--mecanu-text-primary-light);font-weight:700}
.mcn-tab.is-active::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--mecanu-brand-primary-light);z-index:1}
`);
function Tabs({
  items = [],
  activeId,
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "mcn-tabs",
    role: "tablist",
    style: style
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    type: "button",
    role: "tab",
    "aria-selected": it.id === activeId,
    className: "mcn-tab" + (it.id === activeId ? " is-active" : ""),
    onClick: () => onChange && onChange(it.id)
  }, it.label)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.CustomerMiniCard = __ds_scope.CustomerMiniCard;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.MetricsCard = __ds_scope.MetricsCard;

__ds_ns.StatusTimeline = __ds_scope.StatusTimeline;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarGroup = __ds_scope.AvatarGroup;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardList = __ds_scope.CardList;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.ListItem = __ds_scope.ListItem;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.TimeWindow = __ds_scope.TimeWindow;

__ds_ns.ConnectionBanner = __ds_scope.ConnectionBanner;

__ds_ns.ErrorState = __ds_scope.ErrorState;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.StatusBanner = __ds_scope.StatusBanner;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.UpsellAlertCard = __ds_scope.UpsellAlertCard;

__ds_ns.Attachment = __ds_scope.Attachment;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.DateRangePicker = __ds_scope.DateRangePicker;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.BottomSheet = __ds_scope.BottomSheet;

__ds_ns.CameraTrigger = __ds_scope.CameraTrigger;

__ds_ns.EvidenceGrid = __ds_scope.EvidenceGrid;

__ds_ns.IncidentButton = __ds_scope.IncidentButton;

__ds_ns.OversizedButton = __ds_scope.OversizedButton;

__ds_ns.QuickCallButton = __ds_scope.QuickCallButton;

__ds_ns.SignatureCanvas = __ds_scope.SignatureCanvas;

__ds_ns.SlideToConfirm = __ds_scope.SlideToConfirm;

__ds_ns.TireSelector = __ds_scope.TireSelector;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.FilterBar = __ds_scope.FilterBar;

__ds_ns.FilterChip = __ds_scope.FilterChip;

__ds_ns.SearchInput = __ds_scope.SearchInput;

__ds_ns.SidebarNav = __ds_scope.SidebarNav;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
