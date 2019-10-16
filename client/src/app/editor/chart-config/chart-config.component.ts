import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelectionList } from '@angular/material';

import { Utils } from '../../_helpers/utils';
import { Device } from '../../_models/device';

@Component({
  selector: 'app-chart-config',
  templateUrl: './chart-config.component.html',
  styleUrls: ['./chart-config.component.css']
})
export class ChartConfigComponent implements OnInit {

    @ViewChild(MatSelectionList) selTags: MatSelectionList;

    selectedChart = { id: null, name: null, lines: [] };
    selectedDevice = { id: null, name: null, tags: []};
    selectedTags = [];
    data = { charts: [], devices: [] };
    defaultColor = Utils.defaultColor;
    lineColor = Utils.lineColor;

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<ChartConfigComponent>,
        @Inject(MAT_DIALOG_DATA) public param: any) {
            this.data.charts = param.charts;
            Object.values(param.devices).forEach(device => {
                let devicobj = Object.assign({}, <Device>device);
                devicobj.tags = Object.values((<Device>device).tags);
                this.data.devices.push(devicobj);
            });
        }

    ngOnInit() {
        // this.data = {
        //     charts: [{ id: 'My chart A', name: 'My chart A', lines: [{ device: 'a', id: 'ab', name: 'aB' }] },
        //              { id: 'My chart B', name: 'My chart B', lines: []}],
        //     devices: [{ id: 'a', name: 'Device A', tags: [{ id: 'aa', name: 'aA' }, { id: 'ab', name: 'aB' }, { id: 'ac', name: 'aC' }]},
        //         { id: 'b', name: 'Device B', tags: [{ id: 'ba', name: 'bA' }, { id: 'bb', name: 'bB' }, { id: 'bc', name: 'bC' }, { id: 'bd', name: 'bD' }]}] };
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close({ charts: this.data.charts });
    }

    editChart(chart) {
        let dialogRef = this.dialog.open(DialogListItem, {
            // minWidth: '700px',
            // minHeight: '700px',
            panelClass: 'dialog-property',
            data: { name: (chart) ? chart.name : '' },
            position: { top: '80px' }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result && result.name && result.name.length > 0) {
                // this.dirty = true;
                if (chart) {
                    chart.name = result.name;
                } else {
                    this.data.charts.push({ id: result.name, name: result.name, lines: [] });
                }
            }
        });
    }

    deleteChart(chart) {
        console.log(chart);
    }

    selectDevice(device) {
        this.selectedDevice = JSON.parse(JSON.stringify(device));
        this.loadDeviceConfig();
    }

    loadChartConfig() {
        this.selectedDevice = { id: null, name: null, tags: [] };
        this.loadDeviceConfig();
    }

    loadDeviceConfig() {
        if (this.selectedChart && this.selectedChart.lines && this.selectedDevice) {
            this.selectedChart.lines.forEach(line => {
                this.selectedDevice.tags.forEach(tag => {
                    if (line.device === this.selectedDevice.id && line.id === ((tag.address) ? tag.address : tag.id)) {
                        tag.selected = true;
                    }
                });
            });
        }
    }

    /**
     * add or remove the selected device tags to the selected chart in char-line list
     * @param chart
     * @param device
     * @param tags
     */
    checkChartTags(chart, device, tags) {
        if (chart && chart.id) {
            let toremove = [];
            // check to remove
            if (chart.lines) {
                for (let i = 0; i < chart.lines.length; i++) {
                    if (chart.lines[i].device === device.id) {
                        if (tags.map(x => x.id).indexOf(chart.lines[i].id) === -1) {
                            toremove.push(i);
                        }
                    }
                }
            }
            // remove
            for (let i = 0; i < toremove.length; i++) {
                chart.lines.splice(toremove[i], 1);
            }
            // add if not exist
            for (let x = 0; x < tags.length; x++) {
                let found = false;
                if (chart.line) {
                    for (let i = 0; i < chart.lines.length; i++) {
                        if (chart.lines[i].device === device.id && chart.lines[i].id === ((tags[x].address) ? tags[x].address : tags[x].id)) {
                            found = true;
                        }
                    }
                }
                if (!found) {
                    const myCopiedObject = {};//Object.assign({}, tags[x]);
                    myCopiedObject['id'] = (tags[x].address) ? tags[x].address : tags[x].id;
                    myCopiedObject['name'] = tags[x].name;
                    myCopiedObject['device'] = device.id;
                    myCopiedObject['color'] = this.getNextColor();
                    chart.lines.push(myCopiedObject);
                }
            }
        }
    }

    tagSelectionChanged(event) {
        this.checkChartTags(this.selectedChart, this.selectedDevice, this.selectedTags);
    }

    editChartLine(tag) {
        console.log('ed ' + tag);
    }

    removeChartLine(tag) {
        console.log('rm ' + tag);
    }

    isChartSelected(chart) {
        if (chart === this.selectedChart) {
            return 'list-item-selected';
        }
    }

    isDeviceSelected(device) {
        if (device && device.id === this.selectedDevice.id) {
            return 'list-item-selected';
        }
    }

    getDeviceName(deviceid) {
        let obj = this.data.devices.filter(x => x.id === deviceid);
        if (obj && obj.length > 0) {
            return obj[0].name;
        }
        return '';
    }

    getNextColor() {
        for (let x = 0; x < this.lineColor.length; x++) {
            let found = false;
            if (this.selectedChart.lines) {
                for (let i = 0; i < this.selectedChart.lines.length; i++) {
                    if (this.selectedChart.lines[i].color === this.lineColor[x]) {
                        found = true;
                    }
                }
            }
            if (!found) {
                return this.lineColor[x];
            }
        }
        return Utils.lineColor[0];
    }
}

@Component({
    selector: 'dialog-list-item',
    templateUrl: './list-item.dialog.html',
})
export class DialogListItem {
    // defaultColor = Utils.defaultColor;
    constructor(
        public dialogRef: MatDialogRef<DialogListItem>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close(true);
    }

}
