from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [('image', '0001_initial')]
    operations = [
        migrations.AddField(model_name='prod_image', name='position', field=models.IntegerField(default=0)),
        migrations.AddField(model_name='prod_image', name='role', field=models.CharField(default='original', max_length=20)),
        migrations.AlterModelOptions(name='prod_image', options={'ordering': ['position', 'id']}),
    ]
