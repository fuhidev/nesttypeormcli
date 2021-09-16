import * as myExtension from '../src/extension';
import * as vscodeTestContent from 'vscode-test-content';
import * as sinon from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as mocha from 'mocha';
import { FileContents } from './../src/file-contents';
import { TemplateType } from './../src/enums/template-type';
import { config as defaultConfig } from './../src/config/cli-config';
import { IConfig } from '../src/models/config';
import * as dJSON from 'dirty-json';

chai.use(sinonChai);

const expect = chai.expect;
let config: IConfig = dJSON.parse(JSON.stringify(defaultConfig));

describe('File content tests', () => {
  const fc = new FileContents();
  fc.loadTemplates();

  beforeEach(() => {
    config = dJSON.parse(JSON.stringify(defaultConfig));
  });

  describe('Service tests', () => {
    it('Should create a valid service', () => {
      const content = fc.getTemplateContent(TemplateType.Service, config, 'angular-files');

      expect(content).to.contain('@Injectable()', 'Should be injectable service').throw;
      expect(content).to.contain('export class', 'Should export service').throw;
      expect(content).to.contain('AngularFilesService', 'Should have a valid service name').throw;
      expect(content.split(/\r?\n/).pop()).to.be.eql('', 'Should end with a newline').throw;
    });

  });


  describe('Module tests', () => {
    it('Should create a valid module', () => {
      const content = fc.getTemplateContent(TemplateType.Module, config, 'angular-files');

      expect(content).to.contain('export class AngularFilesModule', 'Should export module').throw;
      expect(content).to.contain('declarations: [AngularFilesComponent]', 'Should declare component').throw;
      expect(content).to.contain('@NgModule({', 'Should define new module').throw;
      expect(content.split(/\r?\n/).pop()).to.be.eql('', 'Should end with a newline').throw;
    });
  });


  describe('Component tests', () => {
    it('Should create a valid component', () => {
      const content = fc.getTemplateContent(TemplateType.Controller, config, 'angular-files');

      expect(content).to.contain('export class AngularFilesComponent', 'Should export component').throw;
      expect(content).to.contain(`selector: 'app-angular-files'`, 'Should have a valid selector').throw;
      expect(content).to.contain('@Component({', 'Should define new component').throw;
      expect(content).to.contain('templateUrl', 'Should define templateUrl').throw;
      expect(content).to.contain('styleUrls', 'Should define styleUrls').throw;
      expect(content.split(/\r?\n/).pop()).to.be.eql('', 'Should end with a newline').throw;
    });

    it('Should create a valid component with app prefix', () => {
      const content = fc.getTemplateContent(TemplateType.Controller, config, 'angular-files');

      expect(content).to.contain(`selector: 'ng-angular-files'`, 'Should have a valid selector').throw;
    });

  });
});
