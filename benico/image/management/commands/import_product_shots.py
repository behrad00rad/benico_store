from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from image.models import prod_image
from product.models import item

class Command(BaseCommand):
    help = 'Register curated product shots once so staff can manage them. Never restores deleted shots.'
    def handle(self, **options):
        marker = settings.BASE_DIR / '.product-shots-imported'
        if marker.exists():
            self.stdout.write('Product shots already imported.')
            return
        root = settings.BASE_DIR.parent / 'front/src/assets/product-shots'
        for product_id, prefix in [(6999,'savior'), (7000,'infinite'), (8101,'xray'), (8102,'navy'), (8103,'infinite')]:
            if not item.objects.filter(pk=product_id).exists():
                continue
            for index, (role, suffix) in enumerate([('mockup','cutout-v2.png'), ('model','model-v2.webp'), ('detail','detail-v3.webp')]):
                name = f'product-shots/{product_id}-{prefix}-{suffix}'
                if prod_image.objects.filter(prod_id=product_id, img=name).exists():
                    continue
                shot = prod_image(prod_id=product_id, position=index-3, role=role)
                with (root / f'{prefix}-{suffix}').open('rb') as source:
                    shot.img.save(name, File(source), save=True)
        marker.write_text('Imported. Do not rerun to restore deleted images.')
        self.stdout.write('Product shots registered.')
