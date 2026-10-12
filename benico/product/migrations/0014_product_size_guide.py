from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('product', '0013_refresh_persian_store_copy')]
    operations = [migrations.AddField(model_name='item', name='size_guide', field=models.TextField(blank=True, default=''))]
