import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
	const { fullViewport } = attributes;

	const blockProps = useBlockProps({
		className: fullViewport ? 'is-full-viewport' : undefined,
	});

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('表示設定', 'ns-media-hero-showcase')}>
					<ToggleControl
						label={__('フルビューポート（100vw/100svh）', 'ns-media-hero-showcase')}
						checked={fullViewport}
						onChange={(value) => setAttributes({ fullViewport: value })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<p>{__('Hero Showcase ブロック', 'ns-media-hero-showcase')}</p>
				{fullViewport && (
					<p><small>{__('フルビューポートモード有効', 'ns-media-hero-showcase')}</small></p>
				)}
			</div>
		</>
	);
}