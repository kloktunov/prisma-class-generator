import { FIELD_TEMPLATE } from '../templates/field.template'
import { Echoable } from '../interfaces/echoable'
import { BaseComponent } from './base.component'
import { DMMF } from '@prisma/generator-helper'
import { ImportComponent } from './import.component'

const FiledCustomDecorators = {

	HIDE: "@hide",
	POSTDATA: "@postdata",

}

export class FieldComponent extends BaseComponent implements Echoable {
	field: DMMF.Field
	nullable: boolean
	useUndefinedDefault: boolean
	default?: string
	type?: string;
	imports: ImportComponent[] = [];

	get hasHideDecorator(): boolean {

		return this.field.documentation?.includes(FiledCustomDecorators.HIDE);

	}

	get postData(): string {

		let { documentation } = this.field;

		if(!documentation){
			return "";
		}

		let docs = documentation.split('----');

		let postDataDoc = docs.find(item => item.includes(FiledCustomDecorators.POSTDATA));
		let postData = postDataDoc?.replace(FiledCustomDecorators.POSTDATA, '') ?? "";

		return postData;

	}

	extractImports() {

		if(this.postData.length == 0){
			return;
		}

		let hasExpose = this.postData.includes('@Expose()');
		let hasApiProperty = this.postData.includes('@ApiProperty');

		if(hasExpose){
			this.imports.push(new ImportComponent('class-transformer', 'Expose'))
		}

		if(hasApiProperty){
			this.imports.push(new ImportComponent('@nestjs/swagger', 'ApiProperty'))
		}

	}

	echo = () => {
		let name = this.field.name
		if (this.nullable === true) {
			name += '?'
		}

		let defaultValue = ''
		if (this.default) {
			defaultValue = ` = ${this.default}`
		} else {
			if (this.useUndefinedDefault === true) {
				defaultValue = ` = undefined`
			}
		}

		return FIELD_TEMPLATE.replace('#!{NAME}', name)
			.replace('#!{NAME}', name)
			.replace('#!{TYPE}', this.type)
			.replace('#!{DECORATORS}', this.echoDecorators())
			.replace('#!{DEFAULT}', defaultValue)
			.replace('#!{POSTDATA}', this.postData);
	}

	constructor(obj: { field: DMMF.Field; useUndefinedDefault: boolean }) {
		super(obj)

		this.extractImports();

	}
}
